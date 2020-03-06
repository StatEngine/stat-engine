import _ from 'lodash';
import moment from 'moment-timezone';
import bodybuilder from 'bodybuilder';
import util from 'util';
import percentile from 'percentile';

import connection from '../../elasticsearch/connection';

function getResponseClassOrder(key) {
  let upper = key.toUpperCase();

  if (upper === 'EMS') return 0;
  if (upper === 'FIRE' || upper === 'SUPPRESSION') return 1;
  if (upper.includes('RESCUE')) return 2;
  if (upper === 'HAZMAT') return 3;
  else return 4;
}

function getRiskOrder(key) {
  let upper = key.toUpperCase();

  if (upper === 'LOW') return 0;
  if (upper === 'MEDIUM') return 1;
  if (upper === 'HIGH') return 2;
  if (upper.includes('MAX')) return 3;
  else return 4;
}

export async function formData(req, res, next) {
  let fd = req.user.FireDepartment.get();

  let base = bodybuilder()
    .size(0)
    .aggregation('terms', 'description.response_class', { size: 10, order: { _term: 'asc' }}, responseClass => responseClass
      .aggregation('terms', 'description.risk_category', { size: 10, order: { _term: 'desc' }}, riskCategory => riskCategory
        .aggregation('terms', 'description.type', { size: 100, order: { _term: 'asc' }})))
    .sort('description.event_opened', 'desc')
  req.esBody = base
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: req.esBody,
  });


  req.response_classes = [];
  _.map(searchResults.aggregations['agg_terms_description.response_class'].buckets, response_class => {
    let reponse_class_obj = {
      key: response_class.key,
      risk_categories: [],
      order: getResponseClassOrder(response_class.key)
    };

    _.map(response_class['agg_terms_description.risk_category'].buckets, risk_category => {
      let risk_categogry_obj = {
        key: risk_category.key,
        order: getRiskOrder(risk_category.key),
        dispatch_types: ['All']
      };

      _.map(risk_category['agg_terms_description.type'].buckets, type => risk_categogry_obj.dispatch_types.push(type.key));
      reponse_class_obj.risk_categories.push(risk_categogry_obj);
    });
    reponse_class_obj.risk_categories = _.orderBy(reponse_class_obj.risk_categories, rc => rc.order);
    req.response_classes.push(reponse_class_obj);
  });

  req.response_classes = _.orderBy(req.response_classes, rc => rc.order);

  next();
}

// Top 10000 incidents, in which 1 unit arrives
export async function queryIncidents(req, res, next) {
  let fd = req.user.FireDepartment.get();

  let body = bodybuilder()
    .size(10000)
    .filter('term', 'description.suppressed', false)
    .filter('exists', 'description.first_unit_arrived')
    .rawOption('_source', [
      'description.incident_number',
      'description.psap_answer_time',
      'description.first_unit_enroute',
      'description.first_unit_dispatched',
      'apparatus.unit_status.arrived.order',
      'apparatus.resources.personnel.total',
      'apparatus.unit_id',
      'apparatus.unit_status.arrived.timestamp', ]);

  if (req.query.type.toLowerCase() !== 'all') {
    body.filter('term', 'description.type', req.query.type)
  } else {
    body.filter('term', 'description.risk_category', req.query.risk_category)
    body.filter('term', 'description.response_class', req.query.response_class)
  }

  if (req.query.year.toLowerCase() !== 'all') {
    const start = moment.tz(`01-05-${req.query.year}`, 'MM-DD-YYYY', fd.timezone).startOf('year').format();
    const end = moment.tz(`01-05-${req.query.year}`, 'MM-DD-YYYY', fd.timezone).endOf('year').format();
    body.filter('range', 'description.event_opened', { gte: start, lt: end })
  }

  body = body.build();

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
  if (req.query.type.toLowerCase() == 'all') {
    return next();
  }

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
      erf: Number(searchResults.hits.hits[0]._source.description.requirements.personnel.total_arriving),
    }
  }
  next();
}

export async function precheck(req, res) {
  let fd = req.user.FireDepartment.get();

  let body = bodybuilder()
    .size(1)
    .filter('exists', 'description.requirements.personnel.total_arriving')
    .rawOption('_source', [
      'description.requirements.personnel.total_arriving',
    ])
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body,
  });

  let now = moment().year();

  if (!searchResults.hits.hits || searchResults.hits.hits.length < 1) {
    req.error = "Not currently configured";
  }
  res.json({
    error: req.error,
    response_classes: req.response_classes,
    years: ['All', now, now-1, now-2, now-3, now-4, now-5],
  });
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
