import _ from 'lodash';
import { sequelize, Workspace, FireDepartment, UserWorkspace, User, FixtureTemplate } from '../../sqldb';
import esConnection from '../../elasticsearch/connection';
import bodybuilder from 'bodybuilder';
import Promise from 'bluebird';
import parseJsonTemplate from 'json-templates';

export async function create(req, res) {
  const name = req.body.name;
  const description = req.body.description;
  const color = req.body.color;
  const dashboardIds = req.body.dashboardIds;
  const users = req.body.users;

  let workspace = Workspace.build({
    name,
    description,
    color,
  });

  // force this all so user cannot overwrite in request
  workspace.setDataValue('fire_department__id', req.user.FireDepartment._id);
  await sequelize.transaction(async transaction => {
    // TODO: Maybe remove this assignment... it might not be necessary.
    workspace = await workspace.save({ transaction });

    // make the user an owner
    const permissionPromises = [UserWorkspace.create({
      user__id: req.user._id,
      workspace__id: workspace._id,
      permission: 'admin',
      is_owner: true,
    }, { transaction })];

    // update any other user permissions
    users.forEach(u => {
      if (u._id !== req.user._id && (u.is_owner || u.permission)) {
        permissionPromises.push(UserWorkspace.create({
          user__id: u._id,
          workspace__id: workspace._id,
          permission: u.permission,
          is_owner: u.is_owner,
        }, { transaction }));
      }
    });

    await Promise.all(permissionPromises);
  });

  //
  // Update Kibana.
  //
  const fireDepartment = req.fireDepartment.get();

  // Kibana Template.
  await seedWorkspaceKibanaTemplate({
    workspace,
    fireDepartment,
  });

  // Index Patterns.
  await addFixturesToWorkspaceByType({
    type: 'index-pattern',
    workspace,
    fireDepartment,
  });

  // Config.
  await addFixturesToWorkspaceByType({
    type: 'config',
    workspace,
    fireDepartment,
  });

  // Visualizations.
  await addFixturesToWorkspaceByType({
    type: 'visualization',
    workspace,
    fireDepartment,
  });

  // Dashboards.
  await addFixturesToWorkspaceByIds({
    ids: dashboardIds,
    workspace,
    fireDepartment,
  });

  res.json(workspace);
}

export async function edit(req, res) {
  await sequelize.transaction(t => {
    const calls = [];
    calls.push(Workspace.update({
      name: req.body.name,
      description: req.body.description,
      color: req.body.color,
    }, {
      where: {
        _id: req.params.id
      },
      transaction: t
    }));

    // update permissions
    req.body.users.forEach(u => {
      calls.push(UserWorkspace
        .findOne({
          where: {
            workspace__id: req.params.id,
            user__id: u._id,
          }
        }, {
          transaction: t
        })
        .then(userWorkspace => {
          if(userWorkspace) {
            return userWorkspace.update({
              permission: u.permission,
              is_owner: u.is_owner,
            }, { transaction: t });
          } else {
            return UserWorkspace.create({
              user__id: u._id,
              workspace__id: req.params.id,
              permission: u.permission,
              is_owner: u.is_owner,
            }, { transaction: t });
          }
        }));
    });

    return Promise.all(calls);
  });
  res.status(204).send();
}

export async function get(req, res) {
  const workspace = req.workspace.get();

  // Get the workspace's dashboards.
  // TODO: Replace with Kibana API call.
  const esResponse = await esConnection.getClient().search({
    index: req.workspace.getIndex(req.fireDepartment),
    body: bodybuilder()
      .query('match', 'type', 'dashboard')
      .build(),
  });

  workspace.dashboards = [];
  for (const dashboard of esResponse.hits.hits) {
    workspace.dashboards.push({
      id: dashboard._id,
      title: dashboard._source.dashboard.title,
    })
  }

  // cleanup api call
  let users = workspace.Users;
  delete workspace.FireDepartment;
  delete workspace.Users;
  workspace.users = [];

  users.forEach((u) => {
    if (!u.isAdmin && !u.isGlobal && u.isDashboardUser)
    workspace.users.push({
      _id: u._id,
      email: u.email,
      username: u.username,
      is_owner: _.get(u, 'UserWorkspace.is_owner') || false,
      permission: _.get(u, 'UserWorkspace.permission') || null,
    })
  });

  res.json(req.workspace);
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

async function addFixturesToWorkspaceByIds({ ids, workspace, fireDepartment }) {
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { _id: ids },
  });

  await addFixturesToWorkspace({
    fixtureTemplates,
    workspace,
    fireDepartment,
  });
}

async function addFixturesToWorkspaceByType({ type, workspace, fireDepartment }) {
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { type },
  });

  await addFixturesToWorkspace({
    workspace,
    fireDepartment,
    fixtureTemplates,
  });
}

async function addFixturesToWorkspace({ fixtureTemplates, workspace, fireDepartment }) {
  console.log('ADDING FIXTURES');
  console.log(fixtureTemplates.map(t => t._id));

  // Get the Kibana template data from the fixture template.
  const kibanaTemplates = [];
  for (const fixtureTemplate of fixtureTemplates) {
    kibanaTemplates.push(fixtureTemplate.kibana_template);
  }

  // Apply variables to the Kibana templates.
  const kibanaTemplateVariables = {
    fire_department: fireDepartment,
    kibana: {
      tenancy: workspace.getIndex(fireDepartment),
    },
  };

  const appliedKibanaTemplates = [];
  for (const kibanaTemplate of kibanaTemplates) {
    const parsedTemplate = parseJsonTemplate(JSON.stringify(kibanaTemplate));
    const appliedTemplate = JSON.parse(parsedTemplate(kibanaTemplateVariables));

    if (Array.isArray(appliedTemplate)) {
      appliedTemplate.forEach(obj => appliedKibanaTemplates.push(obj));
    } else {
      appliedKibanaTemplates.push(appliedTemplate);
    }
  }

  // Update docs in ES.
  const index = workspace.getIndex(fireDepartment);
  for (const doc of appliedKibanaTemplates) {
    console.info(`Loading: ${doc._id}`);

    // await esConnection.getClient().update({
    //   index: index,
    //   type: doc._type,
    //   id: doc._id,
    //   body: {
    //     doc: doc._source,
    //     doc_as_upsert: true,
    //   },
    // });
  }
}

async function seedWorkspaceKibanaTemplate({ workspace, fireDepartment }) {
  const index = workspace.getIndex(fireDepartment);
  await esConnection.getClient().indices.putTemplate({
    name: `kibana_index_template:${index}`,
    order: 0,
    body: {
      index_patterns: [ index ],
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
