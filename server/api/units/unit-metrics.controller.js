import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

function getApparatusIndex(req) {
  return req.user.FireDepartment.get().es_indices['apparatus-fire-incident'];
}

function getIncidentIndex(req) {
  return req.user.FireDepartment.get().es_indices['fire-incident'];
}

function setMetricGroups(agg) {
  return agg
    .aggregation('percentiles', 'apparatus.extended_data.turnout_duration', { percents: 90 })
    .aggregation('percentiles', 'apparatus.extended_data.travel_duration', { percents: 90 })
    .aggregation('percentiles', 'apparatus.extended_data.response_duration', { percents: 90 })
    .aggregation('value_count', 'apparatus.unit_status.transport_started.timestamp')
    .aggregation('sum', 'apparatus.distance')
    .aggregation('sum', 'apparatus.extended_data.event_duration');
}

function setUnitMetricGroups(agg) {
  return agg
    .aggregation('percentiles', 'apparatus_data.extended_data.turnout_duration', { percents: 90 })
    .aggregation('percentiles', 'apparatus_data.extended_data.travel_duration', { percents: 90 })
    .aggregation('percentiles', 'apparatus_data.extended_data.response_duration', { percents: 90 })
    .aggregation('value_count', 'apparatus_data.unit_status.transport_started.timestamp')
    .aggregation('sum', 'apparatus_data.distance')
    .aggregation('sum', 'apparatus_data.extended_data.event_duration');
}

export async function getResponses(req, res) {
  const timeStart = req.query.timeStart;
  const timeEnd = req.query.timeEnd;
  const from = req.query.from || 0;
  const size = req.query.size || 10;

  let sort;
  if(req.query.sort) {
    sort = req.query.sort.split('+')
      .map(sortItem => {
        const [fieldName, direction] = sortItem.split(',');
        return { [fieldName]: direction };
      });
  } else {
    sort = [{
      'description.event_closed': 'desc',
    }];
  }

  const esBodyBuilder = bodybuilder()
    .rawOption('_source', [
      'description.incident_number',
      'description.category',
      'description.event_opened',
      'description.event_closed',
      'address.address_line1',
      'description.type',
      'description.subtype',
      'apparatus_data.unit_id',
      'apparatus_data.extended_data.*',
      'apparatus_data.unit_status.*',
      'description.shift'])
    .filter('term', 'description.suppressed', false)
    .filter('term', 'apparatus_data.suppressed', false)
    .filter('term', 'apparatus_data.unit_id', req.params.id)
    .sort(sort)
    .from(from)
    .size(size);

  if(timeStart && timeEnd) {
    esBodyBuilder.filter('range', 'description.event_opened', { gte: timeStart, lt: timeEnd });
  }

  const esRes = await connection.getClient().search({
    index: getApparatusIndex(req),
    body: esBodyBuilder.build(),
  });

  res.json({
    items: esRes.hits.hits.map(h => h._source),
    totalItems: esRes.hits.total,
  });
}

export async function getMetrics(req, res) {
  const unitId = req.params.id;
  const timeStart = req.query.timeStart;
  const timeEnd = req.query.timeEnd;
  const subInterval = req.query.subInterval;

  const base = bodybuilder()
    .filter('term', 'description.suppressed', false);

  base.aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
    .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => setMetricGroups(unitAgg)));

  base.aggregation('terms', 'description.category', cagg => cagg
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => setMetricGroups(unitAgg))));

  base.aggregation('terms', 'address.population_density', cagg => cagg
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => setMetricGroups(unitAgg))));

  base.aggregation('date_histogram', 'description.event_opened', { field: 'description.event_opened', interval: subInterval }, dateAgg => dateAgg
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => setMetricGroups(unitAgg))));

  base.aggregation('date_histogram', 'description.event_opened_by_category', { field: 'description.event_opened', interval: subInterval }, dateAgg => dateAgg
    .aggregation('terms', 'description.category', cagg => cagg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => setMetricGroups(unitAgg)))));

  if(timeStart && timeEnd) {
    base.filter('range', 'description.event_opened', { gte: timeStart, lt: timeEnd });
  }

  const esBody = base
    .size(0)
    .build();

  const esRes = await connection.getClient().search({
    index: getIncidentIndex(req),
    body: esBody,
  });

  const api_response = {
    total_data: {},
    grouped_data: {
      category: {},
      population_density: {}
    },
    time_series_data: {
      total_data: {},
      grouped_data: {
        category: {}
      },
    },
  };

  // total data
  const apparatusBuckets = _.get(esRes, 'aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets');
  const totalMetrics = {};
  _.forEach(apparatusBuckets, b => {
    totalMetrics[b.key] = getMetricsFromBucket(metrics, b);
  });
  const rankedMetrics = rankBuckets(totalMetrics);
  api_response.total_data = rankedMetrics[unitId];

  // grouped data
  const categoryBuckets = _.get(esRes, 'aggregations["agg_terms_description.category"]buckets');
  _.forEach(categoryBuckets, categoryBucket => {
    if(_.isNil(api_response.grouped_data.category[categoryBucket.key])) api_response.grouped_data.category[categoryBucket.key] = {};
    const categoryApparatusBuckets = _.get(categoryBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
    const myCatBucket = _.find(categoryApparatusBuckets, b => b.key === unitId);
    api_response.grouped_data.category[categoryBucket.key] = getMetricsFromBucket(metrics, myCatBucket);
  });

  // time series data
  const timeSeriesBuckets = _.get(esRes, 'aggregations["agg_date_histogram_description.event_opened"]buckets');
  _.forEach(timeSeriesBuckets, timeBucket => {
    if(_.isNil(api_response.time_series_data.total_data[timeBucket.key_as_string])) api_response.time_series_data.total_data[timeBucket.key_as_string] = {};
    const timeSeriesApparatusBuckets = _.get(timeBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
    const myTimeBucket = _.find(timeSeriesApparatusBuckets, b => b.key === unitId);
    api_response.time_series_data.total_data[timeBucket.key_as_string] = getMetricsFromBucket(metrics, myTimeBucket);
  });

  const timeSeriesCategoryBuckets = _.get(esRes, 'aggregations["agg_date_histogram_description.event_opened_by_category"]buckets');
  _.forEach(timeSeriesCategoryBuckets, timeCategoryBucket => {
    if(_.isNil(api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string])) api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string] = {};
    const tcategoryBuckets = _.get(timeCategoryBucket, '["agg_terms_description.category"]buckets');

    _.forEach(tcategoryBuckets, categoryBucket => {
      if(_.isNil(api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key])) {
        api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key] = {};
      }
      const categoryApparatusBuckets = _.get(categoryBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
      const myCatBucket = _.find(categoryApparatusBuckets, b => b.key === unitId);
      api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key] = getMetricsFromBucket(metrics, myCatBucket);
    });
  });

  res.json(api_response);
}

export async function getMetricsTotal(req, res) {
  const base = bodybuilder()
    .filter('term', 'description.suppressed', false)
    .filter('term', 'apparatus_data.unit_id', req.params.id);

  base.aggregation('date_histogram', 'description.event_opened', { field: 'description.event_opened', interval: req.query.interval }, dateAgg => setUnitMetricGroups(dateAgg));

  const esBody = base
    .size(0)
    .build();

  const esRes = await connection.getClient().search({
    index: getApparatusIndex(req),
    body: esBody,
  });

  // total data
  const api_response = {
    total_data: {},
    grouped_data: {
      category: {}
    },
    time_series_data: {
      total_data: {},
      grouped_data: {
        category: {}
      },
    },
  };

  const timeSeriesBuckets = _.get(esRes, 'aggregations["agg_date_histogram_description.event_opened"]buckets');
  _.forEach(timeSeriesBuckets, timeBucket => {
    api_response.time_series_data.total_data[timeBucket.key_as_string] = getMetricsFromBucket(unitMetrics, timeBucket);
  });

  res.json(api_response);
}

const metrics = [
  ['total_count', 'doc_count', { rank: 'desc' }],
  ['total_distance_to_incident_miles', '["agg_sum_apparatus.distance"].value', { rank: 'desc' }],
  ['total_commitment_time_seconds', '["agg_sum_apparatus.extended_data.event_duration"].value', { rank: 'desc' }],
  ['90_percentile_turnout_duration_seconds', '["agg_percentiles_apparatus.extended_data.turnout_duration"].values["90.0"]', { rank: 'asc' }],
  ['90_percentile_travel_duration_seconds', '["agg_percentiles_apparatus.extended_data.travel_duration"].values["90.0"]', { rank: 'asc' }],
];

const unitMetrics = [
  ['total_count', 'doc_count', { rank: 'desc' }],
  ['total_distance_to_incident_miles', '["agg_sum_apparatus_data.distance"].value', { rank: 'desc' }],
  ['total_commitment_time_seconds', '["agg_sum_apparatus_data.extended_data.event_duration"].value', { rank: 'desc' }],
  ['90_percentile_turnout_duration_seconds', '["agg_percentiles_apparatus_data.extended_data.turnout_duration"].values["90.0"]', { rank: 'asc' }],
  ['90_percentile_travel_duration_seconds', '["agg_percentiles_apparatus_data.extended_data.travel_duration"].values["90.0"]', { rank: 'asc' }],
];

function getMetricsFromBucket(myMetrics, bucket) {
  const formatted = {};
  myMetrics.forEach(metric => {
    const [name, path] = metric;

    let val = _.get(bucket, path);
    if(!_.isNil(val)) {
      formatted[name] = val;
    }
  });

  return formatted;
}

export function rankBuckets(buckets) {
  const rankedBuckets = buckets;

  let arr = [];
  _.forEach(buckets, (value, key) => {
    value.id = key;
    arr.push(value);
  });

  _.forEach(metrics, metric => {
    // eslint-disable-next-line no-unused-vars
    const [name, path, options] = metric;

    let sorted = _.sortBy(arr, name);
    if(options.rank === 'desc') sorted = sorted.reverse();
    _.forEach(sorted, (val, index) => {
      rankedBuckets[val.id][`${name}_rank`] = index + 1;
    });
  });

  return rankedBuckets;
}