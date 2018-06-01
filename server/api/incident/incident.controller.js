import _ from 'lodash';

import Promise from 'bluebird';
import connection from '../../elasticsearch/connection';

import {
  generateTextualSummaries,
  generateAnalysis,
}
from './incident.helpers';

import {
  getMatrix
} from './mapbox.helpers';

export function getRecentIncidents(req, res) {
  const client = connection.getClient();

  const params = {
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    size: 50,
    body: {
      _source: [
        'description.incident_number',
        'address.address_line1',
        'description.event_opened',
        'description.event_closed',
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

  if (req.query.q) params.q = req.query.q;
  else params.body.query = {
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


  client.search(params)
    .then((searchResults) => {
      res.json(searchResults.hits.hits);
    })
    .catch(err => res.status(500).send());
}

export function getIncident(req, res) {
  res.json({
    incident: req.incident,
    textSummaries: generateTextualSummaries(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    analysis: generateAnalysis(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    travelMatrix: req.travelMatrix,
    comparison: req.incidentComparison,
  });
}

export function loadMatrix(req, res, next) {
  getMatrix(req.incident, (err, matrix) => {
    if (err) return next(err);
    else req.travelMatrix = matrix;
    next();
  });
}

export function loadComparison(req, res, next) {
  let responseZone = req.incident.address.response_zone;
  let battalion = req.incident.address.battalion;
  let firstDue = req.incident.address.first_due;
  let addressLine1 = req.incident.address.address_line1;
  let census = req.incident.address.location.census.census_2010.tract;
  let councilDistrict = req.incident.address.location.council_district;
  let precinct = req.incident.address.location.precinct;
  let ward = req.incident.address.location.precinct_ward;
  let neighborhood = req.incident.address.location.neighborhood;

  const pulsePoint = !_.isEmpty(req.incident.description.extended_data.AgencyIncidentCallTypeDescription);
  const incidentType = pulsePoint ? req.incident.description.extended_data.AgencyIncidentCallTypeDescription : req.incident.description.type;
  const incidentTypeFilter = pulsePoint ? { term: {'description.extended_data.AgencyIncidentCallTypeDescription.keyword': incidentType }} : { term: {'description.type': incidentType }};

  const aggs = [
    [`Response Zone: ${responseZone}`, { term: {'address.response_zone': responseZone }}],
    [`Battalion: ${battalion}`, { term: {'address.battalion': battalion }}],
    [`First Due: ${firstDue}`, { term: {'address.first_due': firstDue }}],
    [`Address: ${addressLine1}`, { term: {'address.address_line1': addressLine1 }}],
    [`Census: ${census}`, { term: {'address.location.census.census_2010.tract': census }}],
    [`Council District: ${councilDistrict}`, { term: {'address.location.council_district': councilDistrict }}],
    [`Incident Type: ${incidentType}`, incidentTypeFilter],
    [`Precinct: ${precinct}`, { term: {'address.location.precinct': precinct }}],
    [`Ward: ${ward}`, { term: {'address.location.precinct_ward': ward }}],
    [`Neighborhood: ${neighborhood}`, { term: {'address.location.neighborhood': neighborhood }}],
  ].filter(rule => rule[0].indexOf('undefined') < 0)
    .reduce((acc, val) => {
      const [name, filter] = val;
      acc[name] = {
        filter,
        aggs: {
          response_duration_percentile_rank: {
            percentiles: {
              field: 'description.extended_data.response_duration',
              percents: [90]
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
  }).then(res => {
    req.incidentComparison = res.aggregations;
    next();
  })
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
    .then((searchResult) => {
      const hits = _.get(searchResult, 'hits.hits');
      console.dir(hits)
      console.dir(hits.length)

      if (!hits || hits.length === 0) return res.status(404).send();

      req.incident = hits[0]._source;
      next();
    })
    .catch(err => next(err));
}
