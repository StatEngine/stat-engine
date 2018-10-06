import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

export function setIndex(req, res, next) {
  req.index = req.user.FireDepartment.get().es_indices['fire-incident'],
  next();
}

function setMetricGroups(agg) {
  return agg
      .aggregation('percentiles', 'apparatus.extended_data.turnout_duration', { percents: 90 })
      .aggregation('percentiles', 'apparatus.extended_data.travel_duration', { percents: 90 })
      .aggregation('percentiles', 'apparatus.extended_data.response_duration', { percents: 90 })
      .aggregation('value_count', 'apparatus.unit_status.transport_started.timestamp')
      .aggregation('sum', 'apparatus.distance')
      .aggregation('sum', 'apparatus.extended_data.event_duration')
}

export function buildQuery(req, res, next) {
  let base = bodybuilder()
    .filter('term', 'description.suppressed', false)

    base.aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
        return setMetricGroups(unitAgg)
      }))

    base.aggregation('terms', 'description.category', cagg => cagg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
          return setMetricGroups(unitAgg)
        })))

    base.aggregation('terms', 'address_first_due', cagg => cagg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
          return setMetricGroups(unitAgg)
        })))

    base.aggregation('date_histogram', 'description.event_opened', { field: 'description.event_opened', interval: 'hour' }, dateAgg => dateAgg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
          return setMetricGroups(unitAgg)
        })))

    base.aggregation('date_histogram', 'description.event_opened_by_category', { field: 'description.event_opened', interval: 'hour' }, dateAgg => dateAgg
      .aggregation('terms', 'description.category', cagg => cagg
        .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
          .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
            return setMetricGroups(unitAgg)
          })))
        )

    // TODO
    base.filter('range', 'description.event_opened', { gte: '2018-01-12T00:00:00-05:00', lt: '2018-01-13T00:00:00-05:00' })
    /*if (_.get(req, 'query.timeFilter')) {
      base.filter('range', 'description.event_opened', { gte: timeFilter.start, lt: timeFilter.end })
    }*/

  req.esBody = base
    .size(0)
    .build();

  next();
}

export function buildTotalQuery(req, res, next) {
  let base = bodybuilder()
    .filter('term', 'description.suppressed', false)

    base.aggregation('date_histogram', 'description.event_opened', { field: 'description.event_opened', interval: 'day' }, dateAgg => dateAgg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 1000 }, unitAgg => {
          return setMetricGroups(unitAgg)
        })))

  req.esBody = base
    .size(0)
    .build();

  next();
}

const metrics = [
  ['total_count', 'doc_count', { rank: true }],
  ['total_distance_to_incident_miles', '["agg_sum_apparatus.distance"].value'],
  ['total_commitment_time_seconds', '["agg_sum_apparatus.extended_data.event_duration"].value'],
  ['90_percentile_turnout_duration_seconds', '["agg_percentiles_apparatus.extended_data.turnout_duration"].values["90.0"]', { rank: true }],
  ['90_percentile_travel_duration_seconds', '["agg_percentiles_apparatus.extended_data.travel_duration"].values["90.0"]'],
];

function getMetrics(bucket) {
  const formatted = {};
  metrics.forEach(metric => {
    const [name, path, options] = metric;

    let val = _.get(bucket, path);
    if (!_.isNil(val)) {
      formatted[name] = val;
    }
  });

  return formatted;
}

export function runTotalQuery(req, res, next) {
  const unitId = req.params.id;

  connection.getClient().search({
    index: req.index,
    body: req.esBody,
  }).then(esRes => {
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
      if (_.isNil(api_response.time_series_data.total_data[timeBucket.key_as_string])) api_response.time_series_data.total_data[timeBucket.key_as_string] = {};
      const timeSeriesApparatusBuckets = _.get(timeBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
      const myTimeBucket = _.find(timeSeriesApparatusBuckets, b => b.key === unitId);
      api_response.time_series_data.total_data[timeBucket.key_as_string] = getMetrics(myTimeBucket);
    });

    res.json(api_response);
  });
}

export function runQuery(req, res, next) {
  const unitId = req.params.id;

  connection.getClient().search({
    index: req.index,
    body: req.esBody,
  }).then(esRes => {
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

    // TODO DRY :(

    // total data
    const apparatusBuckets = _.get(esRes, 'aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets');
    const myBucket = _.find(apparatusBuckets, b => b.key === unitId);
    api_response.total_data = getMetrics(myBucket);

    // grouped data
    const categoryBuckets = _.get(esRes, 'aggregations["agg_terms_description.category"]buckets');
    _.forEach(categoryBuckets, categoryBucket => {
      if (_.isNil(api_response.grouped_data.category[categoryBucket.key])) api_response.grouped_data.category[categoryBucket.key] = {};
      const categoryApparatusBuckets = _.get(categoryBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
      const myCatBucket = _.find(categoryApparatusBuckets, b => b.key === unitId);
      api_response.grouped_data.category[categoryBucket.key] = getMetrics(myCatBucket);
    });

    // time series data
    const timeSeriesBuckets = _.get(esRes, 'aggregations["agg_date_histogram_description.event_opened"]buckets');
    _.forEach(timeSeriesBuckets, timeBucket => {
      if (_.isNil(api_response.time_series_data.total_data[timeBucket.key_as_string])) api_response.time_series_data.total_data[timeBucket.key_as_string] = {};
      const timeSeriesApparatusBuckets = _.get(timeBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
      const myTimeBucket = _.find(timeSeriesApparatusBuckets, b => b.key === unitId);
      api_response.time_series_data.total_data[timeBucket.key_as_string] = getMetrics(myTimeBucket);
    });

    const timeSeriesCategoryBuckets = _.get(esRes, 'aggregations["agg_date_histogram_description.event_opened_by_category"]buckets');
    _.forEach(timeSeriesCategoryBuckets, timeCategoryBucket => {
      if (_.isNil(api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string])) api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string] = {};
      const categoryBuckets = _.get(timeCategoryBucket, '["agg_terms_description.category"]buckets');

      _.forEach(categoryBuckets, categoryBucket => {
        if (_.isNil(api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key])) api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key] = {};
        const categoryApparatusBuckets = _.get(categoryBucket, 'apparatus["agg_terms_apparatus.unit_id"].buckets');
        const myCatBucket = _.find(categoryApparatusBuckets, b => b.key === unitId);
        api_response.time_series_data.grouped_data.category[timeCategoryBucket.key_as_string][categoryBucket.key] = getMetrics(myCatBucket);
      });
    });

    res.json(api_response);
  });
}
