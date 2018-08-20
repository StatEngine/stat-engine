import _ from 'lodash';

import {
  Extension,
  ExtensionConfiguration,
  FireDepartment
} from '../../sqldb';

import { publishEnrichmentConfiguration } from '../../publishers';

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    console.error(err);
    return res.status(statusCode).send(err);
  };
}

export function search(req, res) {
  let where = {};
  if(req.user.fire_department__id) {
    where = {
      fire_department__id: req.user.fire_department__id,
    };
  }

  return ExtensionConfiguration.findAll({
    where,
    include: [{
      model: Extension,
      where: { name: req.query.name }
    }]
  })
    .then(extensionConfigurations => res.json(extensionConfigurations))
    .catch(handleError(res));
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

export function updateOptions(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.config_json = _.merge(config.config_json, req.body);
    config.changed('config_json', true);

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}

export function enable(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.enabled = true;

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}

export function disable(req, res) {
  return ExtensionConfiguration.find({
    where: {
      _id: req.params.id,
      fire_department__id: req.fire_department._id,
    },
    include: [{
      model: Extension,
    }, {
      model: FireDepartment,
    }]
  }).then(config => {
    if(!config) return res.status(500).end({ msg: 'Could not find extension configuration'});

    config.enabled = false;

    return config.save()
      .then(updated => {
        publishEnrichmentConfiguration(updated.get());
        return res.status(204).send();
      })
      .catch(handleError(res));
  });
}

export function get(req, res) {
  var id = req.params.id;

  return ExtensionConfiguration.find({
    where: {
      _id: id,
      fire_department__id: req.fire_department._id,
    }
  })
    .then(extensionConfiguration => {
      if(!extensionConfiguration) {
        return res.status(404).end();
      }
      res.json(extensionConfiguration);
    })
    .catch(handleError(res));
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

export function create(req, res) {
  return Extension.find({
    where: {
      name: req.query.name
    }
  })
    .then(extension => {
      if(!extension) return res.status(500).end({ msg: 'Could not find extension'});

      return ExtensionConfiguration.create({
        extension__id: extension._id,
        fire_department__id: req.fire_department._id,
        config_json: createDefaultConfig(req.fire_department, req.query.name),
        enabled: true,
      })
        .then(extensionConfiguration => {
          res.json(extensionConfiguration);
        })
        .catch(handleError(res));
    });
}
