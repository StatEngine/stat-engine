import _ from 'lodash';

import {
  Extension,
  ExtensionConfiguration,
  FireDepartment
} from '../../sqldb';
import { NotFoundError } from '../../util/error';

export async function search(req, res) {
  let where = {};
  if(req.user.fire_department__id) {
    where = {
      fire_department__id: req.user.fire_department__id,
    };
  }

  const extensionConfigurations = await ExtensionConfiguration.findAll({
    where,
    include: [{
      model: Extension,
      where: { name: req.query.name }
    }]
  });

  res.json(extensionConfigurations);
}

export function update(req, res) {
  if(req.query.action === 'enable') {
    return enable(req, res);
  } else if(req.query.action === 'disable') {
    return disable(req, res);
  } else {
    return updateOptions(req, res);
  }
}

export async function updateOptions(req, res) {
  const fire_department = req.fire_department || req.fireDepartment;
  const replace = req.query.replace;

  const config = await ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  });

  if(!config) throw new NotFoundError('Extension configuration not found');

  if (!replace) {
    config.config_json = _.merge(config.config_json, req.body); 
  } else {
    config.config_json = req.body;
  }

  config.changed('config_json', true);

  await config.save();

  return res.status(204).send();
}

export async function enable(req, res) {
  const config = await ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  });

  if(!config) throw new NotFoundError('Extension configuration not found');

  config.enabled = true;

  await config.save();

  return res.status(204).send();
}

export async function disable(req, res) {
  const config = await ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  });

  if(!config) throw new NotFoundError('Extension configuration not found');

  config.enabled = false;

  await config.save();

  return res.status(204).send();
}

export async function get(req, res) {
  const id = req.params.id;
  const fire_department = req.fire_department || req.fireDepartment;

  const extensionConfiguration = await ExtensionConfiguration.find({
    where: {
      _id: id,
      fire_department__id: fire_department._id,
    }
  });

  if(!extensionConfiguration) {
    throw new NotFoundError('Extension configuration not found');
  }

  res.json(extensionConfiguration);
}

// This should probably move to factory, a lib, or maybe be stored in db as default?
function createDefaultConfig(fire_department, extensionType) {
  if(extensionType === 'Twitter') {
    return {
      media_text: '',
      tasks: [{
        name: `${fire_department.name} Twitter`,
        schedule: {
          later: 'every 1 hours'
        },
        preprocessors: [{
          type: 'daily',
          options: {
            timezone: `${fire_department.timezone}`
          }
        }],
        queryTemplates: [{
          type: 'count',
          request: {
            index: `${fire_department.es_indices['fire-incident']}`,
            body: {
              query: {
                bool: {
                  must: [{
                    term: {
                      'description.suppressed': false
                    }
                  }],
                  filter: {
                    range: {
                      'description.event_opened': {
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
                      }
                    }
                  }
                }
              }
            }
          }
        }, {
          type: 'count',
          request: {
            index: `${fire_department.es_indices['fire-incident']}`,
            body: {
              query: {
                bool: {
                  must: [{
                    term: {
                      'description.category': 'EMS'
                    }
                  }, {
                    term: {
                      'description.suppressed': false
                    }
                  }],
                  filter: {
                    range: {
                      'description.event_opened': {
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
                      }
                    }
                  }
                }
              }
            }
          }
        }, {
          type: 'count',
          request: {
            index: `${fire_department.es_indices['fire-incident']}`,
            body: {
              query: {
                bool: {
                  must: [{
                    term: {
                      'description.category': 'FIRE'
                    }
                  }, {
                    term: {
                      'description.suppressed': false
                    }
                  }],
                  filter: {
                    range: {
                      'description.event_opened': {
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
                      }
                    }
                  }
                }
              }
            }
          }
        }],
        transforms: [{
          type: 'set',
          path: 'totalIncidentCount',
          value: 'queryResults[0].count'
        }, {
          type: 'set',
          path: 'emsIncidentCount',
          value: 'queryResults[1].count'
        }, {
          type: 'set',
          path: 'fireIncidentCount',
          value: 'queryResults[2].count'
        }],
        actions: [{
          type: 'console',
          options: {}
        }, {
          type: 'twitter',
          options: {
            template: `${fire_department.name} responded to <%= emsIncidentCount %> EMS and <%= fireIncidentCount %> fire incidents yesterday`,
          }
        }]
      }]
    };
  }
  // generate report and others here

  return {};
}

export async function create(req, res) {
  const fire_department = req.fire_department || req.fireDepartment;
  const extension = await Extension.find({
    where: {
      name: req.query.name
    }
  });

  if(!extension) throw new NotFoundError('Extension not found');

  const extensionConfiguration = await ExtensionConfiguration.create({
    extension__id: extension._id,
    fire_department__id: fire_department._id,
    config_json: createDefaultConfig(fire_department, req.query.name),
    enabled: true,
  });

  res.json(extensionConfiguration);
}
