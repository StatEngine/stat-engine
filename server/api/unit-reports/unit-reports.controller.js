import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

export function generateUnitReport(req, res) {
  res.send({ sample: 'ere' });
}

function setMetricGroups(agg) {
  return agg
      .aggregation('percentiles', 'apparatus.extended_data.turnout_duration', { percents: 90 })
      .aggregation('percentiles', 'apparatus.extended_data.response_duration', { percents: 90 })
      .aggregation('value_count', 'apparatus.unit_status.transport_started.timestamp')
      .aggregation('sum', 'apparatus.distance')
      .aggregation('sum', 'apparatus.extended_data.event_duration')
}

const facets = {
  category: {
    type: 'terms',
    field: 'description.category',
  }
};

export function buildQuery(req, res, next) {
  let base = bodybuilder()
    .filter('term', 'description.suppressed', false)

    base.aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 2 }, unitAgg => {
        return setMetricGroups(unitAgg)
      }))

    base.aggregation('date_histogram', 'description.event_opened', { interval: 'month' }, a => a
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 2 }, unitAgg => {
          return unitAgg.aggregation('avg_bucket', { buckets_path: 'agg_sum_apparatus.distance'})
        })))

    base.aggregation('terms', 'description.category', cagg => cagg
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 2 }, unitAgg => {
          return setMetricGroups(unitAgg)
        })))

    if (_.get(req, 'query.timeFilter')) {
      base.filter('range', 'description.event_opened', { gte: timeFilter.start, lt: timeFilter.end })
    }

  req.esQuery = base.build();

  next();
}

export function runQuery(req, res, next) {
  return connection.getClient().search({
    body: req.esQuery,
    size: 0,
    index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
  })
    .then(res);
}



export function loadUnit(req, res, next) {
  next()
}
