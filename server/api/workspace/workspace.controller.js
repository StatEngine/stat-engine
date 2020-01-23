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

  const where = {
    workspace__id: req.params.id,
  };

  // Add ther user clause for non global users
  if (!req.user.isGlobal) {
    where.user__id = req.user._id;
  }

  const result = await UserWorkspace.find({ where });

  if(_.isEmpty(result) || _.isNil(result)) throw new BadRequestError('User does not have access to this workspace');

  req.userWorkspace = result;
  return next();
}

export async function hasWorkspaceOwnerAccess(req, res, next) {
  console.log('hasWorkspaceOwnerAccess');
  if(_.isNil(req.params.id)) throw new BadRequestError('req.params.id not set');

  const where = {
    workspace__id: req.params.id
  };

  // Add ther user clause for non admin users
  if (!req.user.isAdmin) {
    where.user__id = req.user._id;
    where.is_owner = true;
  }

  const result = await UserWorkspace.find({ where });

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
      settings: {
        number_of_shards: '1',
        auto_expand_replicas: '0-1',
      },
      mappings: {
        dynamic: 'strict',
        properties: {
          'canvas-element': {
            dynamic: false,
            properties: {
              '@created': {
                type: 'date'
              },
              '@timestamp': {
                type: 'date'
              },
              content: {
                type: 'text'
              },
              help: {
                type: 'text'
              },
              image: {
                type: 'text'
              },
              name: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              }
            }
          },
          'canvas-workpad': {
            dynamic: false,
            properties: {
              '@created': {
                type: 'date'
              },
              '@timestamp': {
                type: 'date'
              },
              name: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword'
                  }
                }
              }
            }
          },
          config: {
            dynamic: true,
            properties: {
              buildNum: {
                type: 'keyword'
              },
              defaultIndex: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              }
            }
          },
          dashboard: {
            properties: {
              description: {
                type: 'text'
              },
              hits: {
                type: 'integer'
              },
              kibanaSavedObjectMeta: {
                properties: {
                  searchSourceJSON: {
                    type: 'text'
                  }
                }
              },
              optionsJSON: {
                type: 'text'
              },
              panelsJSON: {
                type: 'text'
              },
              refreshInterval: {
                properties: {
                  display: {
                    type: 'keyword'
                  },
                  pause: {
                    type: 'boolean'
                  },
                  section: {
                    type: 'integer'
                  },
                  value: {
                    type: 'integer'
                  }
                }
              },
              timeFrom: {
                type: 'keyword'
              },
              timeRestore: {
                type: 'boolean'
              },
              timeTo: {
                type: 'keyword'
              },
              title: {
                type: 'text'
              },
              version: {
                type: 'integer'
              }
            }
          },
          'file-upload-telemetry': {
            properties: {
              filesUploadedTotalCount: {
                type: 'long'
              }
            }
          },
          'index-pattern': {
            properties: {
              fieldFormatMap: {
                type: 'text'
              },
              fields: {
                type: 'text'
              },
              intervalName: {
                type: 'keyword'
              },
              notExpandable: {
                type: 'boolean'
              },
              sourceFilters: {
                type: 'text'
              },
              timeFieldName: {
                type: 'keyword'
              },
              title: {
                type: 'text'
              },
              type: {
                type: 'keyword'
              },
              typeMeta: {
                type: 'keyword'
              }
            }
          },
          'infrastructure-ui-source': {
            properties: {
              description: {
                type: 'text'
              },
              fields: {
                properties: {
                  container: {
                    type: 'keyword'
                  },
                  host: {
                    type: 'keyword'
                  },
                  pod: {
                    type: 'keyword'
                  },
                  tiebreaker: {
                    type: 'keyword'
                  },
                  timestamp: {
                    type: 'keyword'
                  }
                }
              },
              logAlias: {
                type: 'keyword'
              },
              logColumns: {
                type: 'nested',
                properties: {
                  fieldColumn: {
                    properties: {
                      field: {
                        type: 'keyword'
                      },
                      id: {
                        type: 'keyword'
                      }
                    }
                  },
                  messageColumn: {
                    properties: {
                      id: {
                        type: 'keyword'
                      }
                    }
                  },
                  timestampColumn: {
                    properties: {
                      id: {
                        type: 'keyword'
                      }
                    }
                  }
                }
              },
              metricAlias: {
                type: 'keyword'
              },
              name: {
                type: 'text'
              }
            }
          },
          'inventory-view': {
            properties: {
              autoBounds: {
                type: 'boolean'
              },
              autoReload: {
                type: 'boolean'
              },
              boundsOverride: {
                properties: {
                  max: {
                    type: 'integer'
                  },
                  min: {
                    type: 'integer'
                  }
                }
              },
              customOptions: {
                type: 'nested',
                properties: {
                  field: {
                    type: 'keyword'
                  },
                  text: {
                    type: 'keyword'
                  }
                }
              },
              filterQuery: {
                properties: {
                  expression: {
                    type: 'keyword'
                  },
                  kind: {
                    type: 'keyword'
                  }
                }
              },
              groupBy: {
                type: 'nested',
                properties: {
                  field: {
                    type: 'keyword'
                  },
                  label: {
                    type: 'keyword'
                  }
                }
              },
              metric: {
                properties: {
                  type: {
                    type: 'keyword'
                  }
                }
              },
              name: {
                type: 'keyword'
              },
              nodeType: {
                type: 'keyword'
              },
              time: {
                type: 'integer'
              },
              view: {
                type: 'keyword'
              }
            }
          },
          'kql-telemetry': {
            properties: {
              optInCount: {
                type: 'long'
              },
              optOutCount: {
                type: 'long'
              }
            }
          },
          lens: {
            properties: {
              expression: {
                type: 'keyword',
                index: false
              },
              state: {
                type: 'flattened'
              },
              title: {
                type: 'text'
              },
              visualizationType: {
                type: 'keyword'
              }
            }
          },
          'lens-ui-telemetry': {
            properties: {
              count: {
                type: 'integer'
              },
              date: {
                type: 'date'
              },
              name: {
                type: 'keyword'
              },
              type: {
                type: 'keyword'
              }
            }
          },
          map: {
            properties: {
              bounds: {
                type: 'geo_shape'
              },
              description: {
                type: 'text'
              },
              layerListJSON: {
                type: 'text'
              },
              mapStateJSON: {
                type: 'text'
              },
              title: {
                type: 'text'
              },
              uiStateJSON: {
                type: 'text'
              },
              version: {
                type: 'integer'
              }
            }
          },
          'maps-telemetry': {
            properties: {
              attributesPerMap: {
                properties: {
                  dataSourcesCount: {
                    properties: {
                      avg: {
                        type: 'long'
                      },
                      max: {
                        type: 'long'
                      },
                      min: {
                        type: 'long'
                      }
                    }
                  },
                  emsVectorLayersCount: {
                    type: 'object',
                    dynamic: true
                  },
                  layerTypesCount: {
                    type: 'object',
                    dynamic: true
                  },
                  layersCount: {
                    properties: {
                      avg: {
                        type: 'long'
                      },
                      max: {
                        type: 'long'
                      },
                      min: {
                        type: 'long'
                      }
                    }
                  }
                }
              },
              mapsTotalCount: {
                type: 'long'
              },
              timeCaptured: {
                type: 'date'
              }
            }
          },
          'metrics-explorer-view': {
            properties: {
              chartOptions: {
                properties: {
                  stack: {
                    type: 'boolean'
                  },
                  type: {
                    type: 'keyword'
                  },
                  yAxisMode: {
                    type: 'keyword'
                  }
                }
              },
              currentTimerange: {
                properties: {
                  from: {
                    type: 'keyword'
                  },
                  interval: {
                    type: 'keyword'
                  },
                  to: {
                    type: 'keyword'
                  }
                }
              },
              name: {
                type: 'keyword'
              },
              options: {
                properties: {
                  aggregation: {
                    type: 'keyword'
                  },
                  filterQuery: {
                    type: 'keyword'
                  },
                  groupBy: {
                    type: 'keyword'
                  },
                  limit: {
                    type: 'integer'
                  },
                  metrics: {
                    type: 'nested',
                    properties: {
                      aggregation: {
                        type: 'keyword'
                      },
                      color: {
                        type: 'keyword'
                      },
                      field: {
                        type: 'keyword'
                      },
                      label: {
                        type: 'keyword'
                      }
                    }
                  }
                }
              }
            }
          },
          migrationVersion: {
            dynamic: true,
            properties: {
              'index-pattern': {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              },
              space: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256
                  }
                }
              }
            }
          },
          namespace: {
            type: 'keyword'
          },
          query: {
            properties: {
              description: {
                type: 'text'
              },
              filters: {
                type: 'object',
                enabled: false
              },
              query: {
                properties: {
                  language: {
                    type: 'keyword'
                  },
                  query: {
                    type: 'keyword',
                    index: false
                  }
                }
              },
              timefilter: {
                type: 'object',
                enabled: false
              },
              title: {
                type: 'text'
              }
            }
          },
          references: {
            type: 'nested',
            properties: {
              id: {
                type: 'keyword'
              },
              name: {
                type: 'keyword'
              },
              type: {
                type: 'keyword'
              }
            }
          },
          'sample-data-telemetry': {
            properties: {
              installCount: {
                type: 'long'
              },
              unInstallCount: {
                type: 'long'
              }
            }
          },
          search: {
            properties: {
              columns: {
                type: 'keyword'
              },
              description: {
                type: 'text'
              },
              hits: {
                type: 'integer'
              },
              kibanaSavedObjectMeta: {
                properties: {
                  searchSourceJSON: {
                    type: 'text'
                  }
                }
              },
              sort: {
                type: 'keyword'
              },
              title: {
                type: 'text'
              },
              version: {
                type: 'integer'
              }
            }
          },
          server: {
            properties: {
              uuid: {
                type: 'keyword'
              }
            }
          },
          'siem-ui-timeline': {
            properties: {
              columns: {
                properties: {
                  aggregatable: {
                    type: 'boolean'
                  },
                  category: {
                    type: 'keyword'
                  },
                  columnHeaderType: {
                    type: 'keyword'
                  },
                  description: {
                    type: 'text'
                  },
                  example: {
                    type: 'text'
                  },
                  id: {
                    type: 'keyword'
                  },
                  indexes: {
                    type: 'keyword'
                  },
                  name: {
                    type: 'text'
                  },
                  placeholder: {
                    type: 'text'
                  },
                  searchable: {
                    type: 'boolean'
                  },
                  type: {
                    type: 'keyword'
                  }
                }
              },
              created: {
                type: 'date'
              },
              createdBy: {
                type: 'text'
              },
              dataProviders: {
                properties: {
                  and: {
                    properties: {
                      enabled: {
                        type: 'boolean'
                      },
                      excluded: {
                        type: 'boolean'
                      },
                      id: {
                        type: 'keyword'
                      },
                      kqlQuery: {
                        type: 'text'
                      },
                      name: {
                        type: 'text'
                      },
                      queryMatch: {
                        properties: {
                          displayField: {
                            type: 'text'
                          },
                          displayValue: {
                            type: 'text'
                          },
                          field: {
                            type: 'text'
                          },
                          operator: {
                            type: 'text'
                          },
                          value: {
                            type: 'text'
                          }
                        }
                      }
                    }
                  },
                  enabled: {
                    type: 'boolean'
                  },
                  excluded: {
                    type: 'boolean'
                  },
                  id: {
                    type: 'keyword'
                  },
                  kqlQuery: {
                    type: 'text'
                  },
                  name: {
                    type: 'text'
                  },
                  queryMatch: {
                    properties: {
                      displayField: {
                        type: 'text'
                      },
                      displayValue: {
                        type: 'text'
                      },
                      field: {
                        type: 'text'
                      },
                      operator: {
                        type: 'text'
                      },
                      value: {
                        type: 'text'
                      }
                    }
                  }
                }
              },
              dateRange: {
                properties: {
                  end: {
                    type: 'date'
                  },
                  start: {
                    type: 'date'
                  }
                }
              },
              description: {
                type: 'text'
              },
              favorite: {
                properties: {
                  favoriteDate: {
                    type: 'date'
                  },
                  fullName: {
                    type: 'text'
                  },
                  keySearch: {
                    type: 'text'
                  },
                  userName: {
                    type: 'text'
                  }
                }
              },
              kqlMode: {
                type: 'keyword'
              },
              kqlQuery: {
                properties: {
                  filterQuery: {
                    properties: {
                      kuery: {
                        properties: {
                          expression: {
                            type: 'text'
                          },
                          kind: {
                            type: 'keyword'
                          }
                        }
                      },
                      serializedQuery: {
                        type: 'text'
                      }
                    }
                  }
                }
              },
              sort: {
                properties: {
                  columnId: {
                    type: 'keyword'
                  },
                  sortDirection: {
                    type: 'keyword'
                  }
                }
              },
              title: {
                type: 'text'
              },
              updated: {
                type: 'date'
              },
              updatedBy: {
                type: 'text'
              }
            }
          },
          'siem-ui-timeline-note': {
            properties: {
              created: {
                type: 'date'
              },
              createdBy: {
                type: 'text'
              },
              eventId: {
                type: 'keyword'
              },
              note: {
                type: 'text'
              },
              timelineId: {
                type: 'keyword'
              },
              updated: {
                type: 'date'
              },
              updatedBy: {
                type: 'text'
              }
            }
          },
          'siem-ui-timeline-pinned-event': {
            properties: {
              created: {
                type: 'date'
              },
              createdBy: {
                type: 'text'
              },
              eventId: {
                type: 'keyword'
              },
              timelineId: {
                type: 'keyword'
              },
              updated: {
                type: 'date'
              },
              updatedBy: {
                type: 'text'
              }
            }
          },
          space: {
            properties: {
              _reserved: {
                type: 'boolean'
              },
              color: {
                type: 'keyword'
              },
              description: {
                type: 'text'
              },
              disabledFeatures: {
                type: 'keyword'
              },
              imageUrl: {
                type: 'text',
                index: false
              },
              initials: {
                type: 'keyword'
              },
              name: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 2048
                  }
                }
              }
            }
          },
          telemetry: {
            properties: {
              enabled: {
                type: 'boolean'
              },
              lastReported: {
                type: 'date'
              },
              lastVersionChecked: {
                type: 'keyword',
                ignore_above: 256
              },
              sendUsageFrom: {
                type: 'keyword',
                ignore_above: 256
              },
              userHasSeenNotice: {
                type: 'boolean'
              }
            }
          },
          'timelion-sheet': {
            properties: {
              description: {
                type: 'text'
              },
              hits: {
                type: 'integer'
              },
              kibanaSavedObjectMeta: {
                properties: {
                  searchSourceJSON: {
                    type: 'text'
                  }
                }
              },
              timelion_chart_height: {
                type: 'integer'
              },
              timelion_columns: {
                type: 'integer'
              },
              timelion_interval: {
                type: 'keyword'
              },
              timelion_other_interval: {
                type: 'keyword'
              },
              timelion_rows: {
                type: 'integer'
              },
              timelion_sheet: {
                type: 'text'
              },
              title: {
                type: 'text'
              },
              version: {
                type: 'integer'
              }
            }
          },
          type: {
            type: 'keyword'
          },
          'ui-metric': {
            properties: {
              count: {
                type: 'integer'
              }
            }
          },
          updated_at: {
            type: 'date'
          },
          'upgrade-assistant-reindex-operation': {
            dynamic: true,
            properties: {
              indexName: {
                type: 'keyword'
              },
              status: {
                type: 'integer'
              }
            }
          },
          'upgrade-assistant-telemetry': {
            properties: {
              features: {
                properties: {
                  deprecation_logging: {
                    properties: {
                      enabled: {
                        type: 'boolean',
                        null_value: true
                      }
                    }
                  }
                }
              },
              ui_open: {
                properties: {
                  cluster: {
                    type: 'long',
                    null_value: 0
                  },
                  indices: {
                    type: 'long',
                    null_value: 0
                  },
                  overview: {
                    type: 'long',
                    null_value: 0
                  }
                }
              },
              ui_reindex: {
                properties: {
                  close: {
                    type: 'long',
                    null_value: 0
                  },
                  open: {
                    type: 'long',
                    null_value: 0
                  },
                  start: {
                    type: 'long',
                    null_value: 0
                  },
                  stop: {
                    type: 'long',
                    null_value: 0
                  }
                }
              }
            }
          },
          url: {
            properties: {
              accessCount: {
                type: 'long'
              },
              accessDate: {
                type: 'date'
              },
              createDate: {
                type: 'date'
              },
              url: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 2048
                  }
                }
              }
            }
          },
          visualization: {
            properties: {
              description: {
                type: 'text'
              },
              kibanaSavedObjectMeta: {
                properties: {
                  searchSourceJSON: {
                    type: 'text'
                  }
                }
              },
              savedSearchRefName: {
                type: 'keyword'
              },
              title: {
                type: 'text'
              },
              uiStateJSON: {
                type: 'text'
              },
              version: {
                type: 'integer'
              },
              visState: {
                type: 'text'
              }
            }
          }
        }
      }
    }
  })
}

