import _ from 'lodash';
import moment, { RFC_2822 } from 'moment';
import bodybuilder from 'bodybuilder';
import util from 'util';
import percentile from 'percentile';

import connection from '../../elasticsearch/connection';

export async function formData(req, res) {
  let fd = req.user.FireDepartment.get();

  let base = bodybuilder()
    .size(0)
    .aggregation('terms', 'description.type', { size: 10000, order: { _term: 'asc' }})
    .sort('description.event_opened', 'desc')
  req.esBody = base
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: req.esBody,
  });

  res.json({
    uniqueTypes: _.map(searchResults.aggregations['agg_terms_description.type'].buckets, b => b.key),
  });
}

// Top 5000 incidents, in which 1 unit arrives
export async function queryIncidents(req, res, next) {
  let fd = req.user.FireDepartment.get();

  let body = bodybuilder()
    .size(5000)
    .filter('term', 'description.suppressed', false)
    .filter('term', 'description.type', req.query.type)
    .filter('exists', 'description.first_unit_arrived')
    .rawOption('_source', [
      'description.incident_number',
      'description.psap_answer_time',
      'description.first_unit_enroute',
      'description.first_unit_dispatched',
      'apparatus.unit_status.arrived.order',
      'apparatus.resources.personnel.total',
      'apparatus.unit_id',
      'apparatus.unit_status.arrived.timestamp', ])
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body
  });

  req.incidents = searchResults.hits.hits;
  next();
}

export function calculatePercentiles(req, res, next) {
  req.summerizedStats = {};
  for(let i = req.query.minPersonnel; i <= req.query.maxPersonnel; i++) {
    // filter out negatives
    const erf_total_response_values = _.filter(_.map(req.erfStats[i], 'erf_total_response'), val => val > 0);
    const erf_response_values = _.filter(_.map(req.erfStats[i], 'erf_response'), val => val > 0);
    const erf_travel_values = _.filter(_.map(req.erfStats[i], 'erf_travel'), val => val > 0);

    req.summerizedStats[i] = {
      num_of_incidents: erf_total_response_values.length,
      erf_total_response: percentile(90, erf_total_response_values),
      erf_response: percentile(90, erf_response_values),
      erf_travel: percentile(90, erf_travel_values),
    };
  }

  next();
}

export async function findCurrentConfig(req, res, next) {
  let fd = req.user.FireDepartment.get();

  let body = bodybuilder()
    .size(1)
    .filter('exists', 'description.requirements.personnel.total_arriving')
    .filter('term', 'description.type', req.query.type)
    .rawOption('_source', [
      'description.response_class',
      'description.risk_category',
      'description.requirements.personnel.total_arriving',
    ])
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body,
  });

  if (searchResults.hits.hits && searchResults.hits.hits.length > 0) {
    req.currentConfig = {
      response_class: searchResults.hits.hits[0]._source.description.response_class,
      risk_category: searchResults.hits.hits[0]._source.description.risk_category,
      erf: searchResults.hits.hits[0]._source.description.requirements.personnel.total_arriving,
    }
  }
  next();
}

export function sendResponse(req, res) {
  res.json({
    historic: req.summerizedStats,
    current_config: req.currentConfig,
  });
}

export function calculateDuration(start, end) {
  let startMoment = moment(start);
  let endMoment = moment(end);

  if(!startMoment.isValid() || !endMoment.isValid()) return;

  return endMoment.diff(startMoment);
}

export async function iterateIncidents(req, res, next) {
  req.erfStats = {};

  if(!req.query.minPersonnel) req.query.minPersonnel = 2;
  if(!req.query.maxPersonnel) req.query.maxPersonnel = 35;
  for(let i = req.query.minPersonnel; i <= req.query.maxPersonnel; i++) {
    req.erfStats[i] = [];
  }

  if(!req.incidents || req.incidents.length === 0) {
    next();
  }

  // for each incident
  req.incidents.forEach(incident => {
    // sort by arriving timestamp
    let apparatus = incident._source.apparatus;
    apparatus = _.filter(apparatus, app => !_.isNil(_.get(app, 'unit_status.arrived.timestamp')));
    apparatus = _.sortBy(apparatus, app => _.get(app, 'unit_status.arrived.order'));
    let numberArriving = 0;

    console.log(util.inspect(apparatus, {showHidden: false, depth: null}));

    apparatus.forEach(app => {
      let temp = numberArriving;
      if(_.get(app, 'resources.personnel.total')) numberArriving += app.resources.personnel.total;

      for(let i = temp + 1; i <= numberArriving; i++) {
        if(!req.erfStats[i]) continue;
        let appArrival = _.get(app, 'unit_status.arrived.timestamp');
        req.erfStats[i].push({
          incident_number: incident._source.description.incident_number,
          erf_total_response: calculateDuration(_.get(incident._source, 'description.psap_answer_time'), appArrival),
          erf_response: calculateDuration(_.get(incident._source, 'description.first_unit_dispatched'), appArrival),
          erf_travel: calculateDuration(_.get(incident._source, 'description.first_unit_enroute'), appArrival),
        });
      }
    });
  });

  next();
}
