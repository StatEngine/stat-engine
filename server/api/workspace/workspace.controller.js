'use strict';

import _ from 'lodash';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User } from '../../sqldb';
import esConnection from '../../elasticsearch/connection';
import { KibanaApi } from '../../kibana/kibana-api';
import { FixtureTemplate } from '../../sqldb';
import { BadRequestError, ForbiddenError } from '../../util/error';

export async function create(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const color = req.body.color;
  const dashboards = req.body.dashboards;
  const users = req.body.users;
  const fireDepartment = req.fireDepartment.get();

  const workspace = Workspace.build({
    name,
    description,
    color,
  });
  req.workspace = workspace;

  // force this all so user cannot overwrite in request
  workspace.FireDepartment = req.user.FireDepartment;
  workspace.setDataValue('fire_department__id', workspace.FireDepartment._id);

  await sequelize.transaction(async transaction => {
    await workspace.save({ transaction });

    // make the user an owner
    req.userWorkspace = await UserWorkspace.create({
      user__id: req.user._id,
      workspace__id: workspace._id,
      permission: 'admin',
      is_owner: true,
    }, { transaction });

    // update any other user permissions
    const promises = [];
    for (const user of users) {
      if (user._id !== req.user._id && (user.is_owner || user.permission)) {
        promises.push(UserWorkspace.create({
          user__id: user._id,
          workspace__id: workspace._id,
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction }));
      }
    }

    await Promise.all(promises);
  });

  //
  // Update Kibana
  //

  // We can't connect to the Kibana API with middleware when creating a workspace, since
  // the workspace doesn't exist yet to build the JWT. So manually connect now that it exists.
  await KibanaApi.connect(req);

  const kibanaIndex = workspace.getKibanaIndex(fireDepartment);
  await seedWorkspaceKibanaTemplate(kibanaIndex);

  // TODO: Only add the visualizations that are necessary for the dashboards we're adding.
  // Add all non-dashboard fixtures.
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { type: ['index-pattern', 'config', 'visualization'] },
  });

  await workspace.addFixtures({
    fixtureTemplates,
    kibanaApi: req.kibanaApi,
  });

  // Add dashboard fixtures separately, since we need to generate unique ids for them.
  if (Object.keys(dashboards).length > 0) {
    await workspace.addDashboards({
      dashboards,
      kibanaApi: req.kibanaApi,
    });
  }

  res.json(workspace);
}

export async function edit(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const color = req.body.color;
  const dashboards = req.body.dashboards;
  const users = req.body.users;
  const workspace = req.workspace;

  await sequelize.transaction(async transaction => {
    await workspace.update({
      name,
      description,
      color,
    }, { transaction });

    // update permissions
    const promises = [];
    for (const user of users) {
      const userWorkspace = await UserWorkspace.findOne({
        where: {
          workspace__id: workspace._id,
          user__id: user._id,
        },
        transaction,
      });

      if (userWorkspace) {
        promises.push(userWorkspace.update({
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction }));
      } else {
        promises.push(UserWorkspace.create({
          user__id: user._id,
          workspace__id: workspace._id,
          permission: user.permission,
          is_owner: user.is_owner,
        }, { transaction }));
      }
    }

    await Promise.all(promises);
  });

  //
  // Update Kibana
  //

  // Remove dashboards that aren't in our updated dashboard ids list.
  const workspaceDashboards = await workspace.getDashboards(req.kibanaApi);
  const dashboardRemovals = workspaceDashboards.filter(d => !dashboards[d._id]);

  if (dashboardRemovals.length > 0) {
    await workspace.removeFixtures({
      type: 'dashboard',
      ids: dashboardRemovals.map(d => d._id),
      kibanaApi: req.kibanaApi,
    });
  }

  // Add any new dashboards.
  const workspaceDashboardsById = {};
  workspaceDashboards.forEach(d => workspaceDashboardsById[d._id] = true);

  const dashboardAdditions = {};
  Object.keys(dashboards).forEach(dashboardId => {
    if (workspaceDashboardsById[dashboardId]) {
      return;
    }

    dashboardAdditions[dashboardId] = dashboards[dashboardId];
  });

  if (Object.keys(dashboardAdditions).length > 0) {
    await workspace.addDashboards({
      dashboards: dashboardAdditions,
      kibanaApi: req.kibanaApi,
    });
  }

  res.status(204).send();
}

export async function get(req, res) {
  const workspace = req.workspace;
  const workspaceData = workspace.get();

  workspaceData.dashboards = await workspace.getDashboards(req.kibanaApi);

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

  if(wkspace.slug === 'default') throw new ForbiddenError('Deleting the default workspace is forbidden');

  await Workspace.update({
    is_deleted: true
  }, {
    where: {
      _id: req.params.id
    }
  });

  res.status(204).send();
}

export async function getAll(req, res) {
  // Get all workspaces that user is privy to
  let include = [];
  if (!req.user.isGlobal) include = [{
    model: User,
    where: { _id: req.user._id },
    attributes: []
  }];

  const workspaces = await Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      is_deleted: false,
    },
    include,
  });

  // now fetch each workpace, including users
  if(!workspaces || workspaces.length === 0) return res.json([]).send();

  const result = await Workspace.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id,
      _id: _.map(workspaces, w => w._id),
    },
    include: [{
      model: User,
      attributes: [ 'username', 'email', 'role' ]
    }]
  });

  res.json(result);
}

export async function updateUser(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');
  if(_.isNil(req.body.user.permission)) throw new BadRequestError('req.body.user.permission not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      permission: req.body.user.permission
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: req.body.user.permission,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function updateOwner(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');
  if(_.isNil(req.body.user.is_owner)) throw new BadRequestError('req.body.user.is_owner not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      is_owner: req.body.user.is_owner
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: 'admin',
      is_owner: true,
    });
  }

  res.status(204).send();
}

export async function revokeUser(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      permission: null,
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: null,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function revokeOwner(req, res) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');
  if(_.isNil(req.params.userId)) throw new BadRequestError('req.params.userId not set');

  const userWorkspace = await UserWorkspace.findOne({
    where: {
      workspace__id: req.params.id,
      user__id: req.params.userId,
    }
  });

  if(userWorkspace) {
    await userWorkspace.update({
      is_owner: false,
    });
  } else {
    await UserWorkspace.create({
      user__id: req.params.userId,
      workspace__id: req.params.id,
      permission: null,
      is_owner: false,
    });
  }

  res.status(204).send();
}

export async function hasWorkspaceAccess(req, res, next) {
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');

  if (req.user.isGlobal) return next();

  const result = await UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
    },
  });

  if(_.isEmpty(result) || _.isNil(result)) throw new BadRequestError('User does not have access to this workspace');

  req.userWorkspace = result;
  return next();
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  console.log('hasWorkspaceOwnerAccess');
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');

  if (req.user.isAdmin) return next();

  const result = await UserWorkspace.find({
    where: {
      workspace__id: req.params.id,
      user__id: req.user._id,
      is_owner: true,
    },
  });

  if(_.isEmpty(result) || _.isNil(result)) throw new ForbiddenError('User does not have owner access to this workspace');

  req.userWorkspace = result;

  next();
}

export async function load(req, res, next) {
  const result = await Workspace.find({
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
  });

  req.workspace = result;
  next();
}

//
// Helpers
//

async function seedWorkspaceKibanaTemplate(kibanaIndex) {
  await esConnection.getClient().indices.putTemplate({
    name: `kibana_index_template:${kibanaIndex}`,
    order: 0,
    body: {
      index_patterns: [kibanaIndex],
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
