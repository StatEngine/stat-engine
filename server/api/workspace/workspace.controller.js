'use strict';

import _ from 'lodash';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User } from '../../sqldb';
import esConnection from '../../elasticsearch/connection';
import slugify from 'slugify';

export async function create(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const color = req.body.color;
  const dashboardIds = req.body.dashboardIds;
  const users = req.body.users;
  const fireDepartment = req.fireDepartment.get();

  /* ES Rules for index names
    Lowercase only
    Cannot include \, /, *, ?, ", <, >, |, ` ` (space character), ,, #
    Indices prior to 7.0 could contain a colon (:), but that’s been deprecated and won’t be supported in 7.0+
    Cannot start with -, _, +
    Cannot be . or ..
    Cannot be longer than 255 bytes (note it is bytes, so multi-byte characters will count towards the 255 limit faster)
  */
  const slug = slugify(name, {
    replacement: '-', // replace spaces with replacement
    remove: /[*:?"<>|#\/\\,]/g, // regex to remove characters, TODO test this
    lower: true // result in lower case
  });

  const workspace = Workspace.build({
    name,
    description,
    color,
    slug,
    index: `.kibana_${fireDepartment.firecares_id}_${slug}`,
  });

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);

  await sequelize.transaction(async transaction => {
    await workspace.save({ transaction });

    // make the user an owner
    await UserWorkspace.create({
      user__id: req.user._id,
      workspace__id: workspace._id,
      permission: 'admin',
      is_owner: true,
    }, { transaction });

    // update any other user permissions
    for (const user of users) {
      if (user._id !== req.user._id && (user.is_owner || user.permission)) {
        await UserWorkspace.create({
          user__id: user._id,
          workspace__id: workspace._id,
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction });
      }
    }
  });

  //
  // Update Kibana
  //

  await seedWorkspaceKibanaTemplate(workspace);
  await workspace.addFixturesByType('index-pattern');
  await workspace.addFixturesByType('config');

  // TODO: Only add the visualizations that are necessary for the dashboards we're adding.
  await workspace.addFixturesByType('visualization');

  if (dashboardIds.length > 0) {
    await workspace.addFixturesByIds(dashboardIds);
  }

  res.json(workspace);
}

export async function edit(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const color = req.body.color;
  const dashboardIds = req.body.dashboardIds;
  const users = req.body.users;
  const workspace = req.workspace;

  await sequelize.transaction(async transaction => {
    await workspace.update({
      name,
      description,
      color,
    }, { transaction });

    // update permissions
    for (const user of users) {
      const userWorkspace = await UserWorkspace.findOne({
        where: {
          workspace__id: workspace._id,
          user__id: user._id,
        },
        transaction,
      });

      if (userWorkspace) {
        await userWorkspace.update({
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction });
      } else {
        await UserWorkspace.create({
          user__id: user._id,
          workspace__id: workspace._id,
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction });
      }
    }
  });

  //
  // Update Kibana
  //

  // Remove dashboards that aren't in our updated dashboard ids list.
  const currentDashboards = await workspace.getDashboards();
  const dashboardIdsLookup = {};
  dashboardIds.forEach(id => dashboardIdsLookup[id] = true);

  const dashboardRemovalIds = currentDashboards
    .filter(d => !dashboardIdsLookup[d._id])
    .map(d => d._id);

  await workspace.removeFixturesByIds(dashboardRemovalIds);

  // Add any new dashboards.
  const currentDashboardsIdsLookup = {};
  currentDashboards.forEach(d => currentDashboardsIdsLookup[d._id] = true);

  const dashboardAdditionIds = dashboardIds
    .filter(id => !currentDashboardsIdsLookup[id]);

  await workspace.addFixturesByIds(dashboardAdditionIds);

  res.status(204).send();
}

export async function get(req, res) {
  const workspace = req.workspace;
  const workspaceData = workspace.get();

  workspaceData.dashboards = await workspace.getDashboards();

  // cleanup api call
  let users = workspaceData.Users;
  delete workspaceData.FireDepartment;
  delete workspaceData.Users;
  workspaceData.users = [];

  users.forEach((u) => {
    if (!u.isAdmin && !u.isGlobal && u.isDashboardUser) {
      workspaceData.users.push({
        _id: u._id,
        email: u.email,
        username: u.username,
        is_owner: _.get(u, 'UserWorkspace.is_owner') || false,
        permission: _.get(u, 'UserWorkspace.permission') || null,
      });
    }
  });

  res.json(workspaceData);
}

export async function markAsDeleted(req, res) {
  // prevent deleting default workspace
  const wkspace = await Workspace.findOne({
    where: {
      _id: req.params.id
    }
  });

  if(wkspace.slug === 'default') return res.send(500);

  return await Workspace.update({
    is_deleted: true
  }, {
    where: {
      _id: req.params.id
    }}).then(() => {
    res.status(204).send();
  });
}

export async function getAll(req, res) {
  // Get all workspaces that user is privy to
  let include = [];
  if (!req.user.isGlobal) include = [{
    model: User,
    where: { _id: req.user._id },
    attributes: []
  }];

  return Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      is_deleted: false,
    },
    include,
  })
    .then(workspaces => {
      // now fetch each workpace, including users
      if(!workspaces || workspaces.length === 0) return res.json([]).send();
      return Workspace.findAll({
        where: {
          fire_department__id: req.user.FireDepartment._id,
          _id: _.map(workspaces, w => w._id),
        },
        include: [{
          model: User,
          attributes: [ 'username', 'email', 'role' ]
        }]
      }).then(result => res.json(result));
    });
}

export async function updateUser(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');
  if(_.isNil(req.body.user.permission)) throw new Error('req.body.user.permission not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          permission: req.body.user.permission
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: req.body.user.permission,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send());
}

export async function updateOwner(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');
  if(_.isNil(req.body.user.is_owner)) throw new Error('req.body.user.is_owner not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          is_owner: req.body.user.is_owner
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: 'admin',
          is_owner: true,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function revokeUser(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          permission: null,
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: null,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function revokeOwner(req, res) {
  if(_.isNil(req.params.id)) throw new Error('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new Error('req.params.userId not set');

  return await UserWorkspace
    .findOne({
      where: {
        workspace__id: req.params.id,
        user__id: req.params.userId,
      }
    })
    .then(userWorkspace => {
      if(userWorkspace) {
        return userWorkspace.update({
          is_owner: false,
        });
      } else {
        return UserWorkspace.create({
          user__id: req.params.userId,
          workspace__id: req.params.id,
          permission: null,
          is_owner: false,
        });
      }
    })
    .then(() => res.status(204).send())
}

export async function hasWorkspaceAccess(req, res, next) {
  if(_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  if (req.user.isGlobal) return next();
  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
    },
  })
    .then(result => {
      if(_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have access to this workspace'));
      req.userWorkspace = result;
      return next();
    })
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  if(_.isNil(req.params.id)) return next(new Error('req.params.id not set'));

  if (req.user.isAdmin) return next();
  return UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
      is_owner: true,
    },
  })
    .then(result => {
      if(_.isEmpty(result) || _.isNil(result)) return next(new Error('User does not have owner access to this workspace'));
      return next();
    })
}

export async function load(req, res, next) {
  return Workspace.find({
    where: {
      _id: req.params.id,
      is_deleted: false,
    },
    include: [{
      model: User,
      attributes: ['_id', 'username', 'email', 'role']
    }, {
      model: FireDepartment,
      attributes: ['firecares_id']
    }]
  })
    .then(result => {
      req.workspace = result;
      next();
    })
}

//
// Helpers
//

async function addWorkspaceFixturesByIds({ ids, workspace }) {

}

async function addWorkspaceFixturesByType({ type, workspace }) {

}

async function addWorkspaceFixtures({ fixtureTemplates, workspace }) {

}

async function seedWorkspaceKibanaTemplate(workspace) {
  // TODO: Replace with Kibana API call.
  await esConnection.getClient().indices.putTemplate({
    name: `kibana_index_template:${workspace.index}`,
    order: 0,
    body: {
      index_patterns: [workspace.index],
      index: {
        number_of_shards: '1',
        auto_expand_replicas: '0-1',
      },
      mappings: {
        doc: {
          dynamic: 'strict',
          properties: {
            type: {
              type: 'keyword',
            },
            updated_at: {
              type: 'date',
            },
            config: {
              dynamic: true,
              properties: {
                buildNum: {
                  type: 'keyword',
                },
              },
            },
            'timelion-sheet': {
              properties: {
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                timelion_chart_height: {
                  type: 'integer',
                },
                timelion_columns: {
                  type: 'integer',
                },
                timelion_interval: {
                  type: 'keyword',
                },
                timelion_other_interval: {
                  type: 'keyword',
                },
                timelion_rows: {
                  type: 'integer',
                },
                timelion_sheet: {
                  type: 'text',
                },
                title: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            'index-pattern': {
              properties: {
                fieldFormatMap: {
                  type: 'text',
                },
                fields: {
                  type: 'text',
                },
                intervalName: {
                  type: 'keyword',
                },
                notExpandable: {
                  type: 'boolean',
                },
                sourceFilters: {
                  type: 'text',
                },
                timeFieldName: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
              },
            },
            visualization: {
              properties: {
                description: {
                  type: 'text',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                savedSearchId: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                uiStateJSON: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
                visState: {
                  type: 'text',
                },
              },
            },
            search: {
              properties: {
                columns: {
                  type: 'keyword',
                },
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                sort: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            dashboard: {
              properties: {
                description: {
                  type: 'text',
                },
                hits: {
                  type: 'integer',
                },
                kibanaSavedObjectMeta: {
                  properties: {
                    searchSourceJSON: {
                      type: 'text',
                    },
                  },
                },
                optionsJSON: {
                  type: 'text',
                },
                panelsJSON: {
                  type: 'text',
                },
                refreshInterval: {
                  properties: {
                    display: {
                      type: 'keyword',
                    },
                    pause: {
                      type: 'boolean',
                    },
                    section: {
                      type: 'integer',
                    },
                    value: {
                      type: 'integer',
                    },
                  },
                },
                timeFrom: {
                  type: 'keyword',
                },
                timeRestore: {
                  type: 'boolean',
                },
                timeTo: {
                  type: 'keyword',
                },
                title: {
                  type: 'text',
                },
                uiStateJSON: {
                  type: 'text',
                },
                version: {
                  type: 'integer',
                },
              },
            },
            url: {
              properties: {
                accessCount: {
                  type: 'long',
                },
                accessDate: {
                  type: 'date',
                },
                createDate: {
                  type: 'date',
                },
                url: {
                  type: 'text',
                  fields: {
                    keyword: {
                      type: 'keyword',
                      ignore_above: 2048,
                    },
                  },
                },
              },
            },
            server: {
              properties: {
                uuid: {
                  type: 'keyword',
                },
              },
            },
          },
        },
      },
    },
  });
}
