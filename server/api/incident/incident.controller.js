import _ from 'lodash';

import connection from '../../elasticsearch/connection';

import {
  generateTextualSummaries,
  generateAnalysis,
} from './incident.helpers';

import {
  getMatrix
} from './mapbox.helpers';

export function getRecentIncidents(req, res) {
  const client = connection.getClient();

  const params = {
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    size: 100,
    body: {
      _source: [
        'description.incident_number',
        'address.address_line1',
        'description.event_opened',
        'description.event_closed',
        'description.type',
        'description.units',
        'description.category',
        'durations.total_event.seconds'],
      sort: [{
        'description.event_opened': {
          order: 'desc'
        }
      }]
    }
  };

  if(req.query.q) {
    params.q = req.query.q;
    params.body.sort = ['_score'];
  } else {
    params.body.query = {
      bool: {
        must: [{
          term: {
            'description.active': false,
          }
        }, {
          term: {
            'description.suppressed': false,
          }
        }]
      }
    };
  }

  client.search(params)
    .then(searchResults => {
      res.json(searchResults.hits.hits);
    })
    .catch(() => res.status(500).send());
}

export function getIncident(req, res) {
  res.json({
    incident: req.incident,
    textSummaries: generateTextualSummaries(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    analysis: generateAnalysis(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    travelMatrix: req.travelMatrix,
    comparison: req.incidentComparison,
    concurrent: req.concurrentIncidents,
  });
}

export function loadMatrix(req, res, next) {
  getMatrix(req.incident, (err, matrix) => {
    if(err) return next(err);
    else req.travelMatrix = matrix;
    next();
  });
}

export function loadConcurrent(req, res, next) {
  let eventOpened = _.get(req.incident, 'description.event_opened');
  let eventClosed = _.get(req.incident, 'description.event_closed');

  return connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      size: 100,
      _source: [
        'description.incident_number',
        'address.address_line1',
        'description.event_opened',
        'description.event_closed',
        'description.type',
        'description.units',
        'description.category',
        'address.battalion',
        'address.response_zone',
        'durations.total_event.seconds'],
      sort: [{
        'description.event_opened': {
          order: 'desc'
        }
      }],
      query: {
        constant_score: {
          filter: {
            bool: {
              must: [{
                term: {
                  'description.suppressed': false
                },
              }, {
                term: {
                  'description.active': false
                }
              }],
              must_not: [{
                term: {
                  'description.incident_number': req.incident.description.incident_number,
                }
              }],
              should: [{
                range: {
                  'description.event_opened': {
                    gte: eventOpened,
                    lte: eventClosed,
                  }
                },
              }, {
                range: {
                  'description.event_closed': {
                    gte: eventOpened,
                    lte: eventClosed,
                  }
                },
              }, {
                bool: {
                  filter: [{
                    term: {
                      'description.active': false
                    },
                  }, {
                    range: {
                      'description.event_opened': {
                        lte: eventOpened,
                      }
                    }
                  }, {
                    range: {
                      'description.event_closed': {
                        gte: eventClosed,
                      }
                    }
                  }]
                }
              }],
            },
          },
        },
      }
    }
  })
    .then(response => {
      req.concurrentIncidents = response.hits.hits;
      next();
    });
}

export function loadComparison(req, res, next) {
  let responseZone = _.get(req.incident, 'address.response_zone');
  let battalion = _.get(req.incident, 'address.battalion');
  let firstDue = _.get(req.incident, 'address.first_due');
  let addressLine1 = _.get(req.incident, 'address.address_line1');
  let census = _.get(req.incident, 'address.location.census.census_2010.tract');
  let councilDistrict = _.get(req.incident, 'address.location.council_district');
  let precinct = _.get(req.incident, 'address.location.precinct');
  let ward = _.get(req.incident, 'address.location.precinct_ward');
  let neighborhood = _.get(req.incident, 'address.location.neighborhood');

  const pulsePoint = !_.isEmpty(req.incident.description.extended_data.AgencyIncidentCallTypeDescription);
  const incidentType = pulsePoint ? req.incident.description.extended_data.AgencyIncidentCallTypeDescription : req.incident.description.type;
  const incidentTypeFilter = pulsePoint ? { term: {'description.extended_data.AgencyIncidentCallTypeDescription.keyword': incidentType }} : { term: {'description.type': incidentType }};

  const compValues = {};
  const aggs = [
    ['Response Zone', responseZone, { term: {'address.response_zone': responseZone }}],
    ['Battalion', battalion, { term: {'address.battalion': battalion }}],
    ['First Due', firstDue, { term: {'address.first_due': firstDue }}],
    ['Address', addressLine1, { term: {'address.address_line1': addressLine1 }}],
    ['Census', census, { term: {'address.location.census.census_2010.tract': census }}],
    ['Council District', councilDistrict, { term: {'address.location.council_district': councilDistrict }}],
    ['Incident Type', incidentType, incidentTypeFilter],
    ['Precinct', precinct, { term: {'address.location.precinct': precinct }}],
    ['Ward', ward, { term: {'address.location.precinct_ward': ward }}],
    ['Neighborhood', neighborhood, { term: {'address.location.neighborhood': neighborhood }}],
  ].filter(rule => !_.isNil(rule[1]))
    .reduce((acc, val) => {
      const [label, compValue, filter] = val;
      compValues[label] = compValue;
      acc[label] = {
        filter,
        aggs: {
          response_duration_percentile_rank: {
            percentiles: {
              field: 'durations.response.seconds',
              percents: [75, 90]
            }
          }
        }
      };
      return acc;
    }, {});

  return connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    size: 0,
    body: {
      query: {
        bool: {
          must: [{
            term: {
              'description.suppressed': false
            }
          }],
        },
      },
      aggs
    }
  })
    .then(response => {
      req.incidentComparison = response.aggregations;
      _.forOwn(req.incidentComparison, (value, label) => {
        req.incidentComparison[label].comparison_value = compValues[label];
      });
      next();
    });
}

export function loadIncident(req, res, next, id) {
  const client = connection.getClient();

  client.search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      query: {
        bool: {
          must: {
            term: {
              'description.incident_number': id,
            }
          }
        }
      }
    }
  })
    .then(searchResult => {
      const hits = _.get(searchResult, 'hits.hits');

      if(!hits || hits.length === 0) return res.status(404).send();

      req.incident = hits[0]._source;
      next();
    })
    .catch(err => next(err));
}
