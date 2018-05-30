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
    size: 40,
    body: {
      _source: [
        'description.incident_number',
        'description.event_opened',
        'description.event_closed',
        'description.units',
        'description.category',
        'durations.total_event.minutes'],
      sort: [{
        "description.event_opened": {
          "order": "desc"
        }
      }]
    }
  };

  if (req.query.q) params.q = req.query.q;
  else params.body.query = {
    bool: {
      must: {
        term: {
          'description.active': false,
        }
      }
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
  let census = req.incident.address.location.census.census_2010.tract;
  let councilDistrict = req.incident.address.location.council_district;

  const aggs = [
    [`Response Zone ${responseZone}`, { term: {'address.response_zone': responseZone }}],
    [`Battalion ${battalion}`, { term: {'address.battalion': battalion }}],
    [`First Due ${firstDue}`, { term: {'address.first_due': firstDue }}],
    [`Census ${census}`, { term: {'address.location.census.census_2010.tract': census }}],
    [`Council District ${councilDistrict}`, { term: {'address.location.council_district': councilDistrict }}],
  ].reduce((acc, val) => {
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
  }, {})

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

      if (!hits || hits.length === 0) return res.status(404).send();

      req.incident = hits[0]._source;
      next();
    })
    .catch(err => next(err));
}
