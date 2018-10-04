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

function random() {
  return Math.floor(Math.random() * 100);
}
export function getUnitStats(req, res, next) {
  /*connection.getClient().search({
    index: req.index,
    body: req.searchBody,
  }).then(esRes => {*/

    if (req.query.granularity === 'TOTAL') {
      res.json({
        data: [{
          id: 'total',
          id_data: {
            count: random(),
            commit_time_sum: random(),
          },
          group_by_data: {
            category: {
              FIRE: {
                count: random(),
                commit_time: random(),
              },
              EMS: {
                count: random(),
                commit_time: random(),
              }
            }
          }
        }]
      })
    }
    else {
      res.json({
        data: [{
          id: 'Mon',
          id_data: {
            count: random(),
            commit_time_sum: random(),
          },
          group_by_data: {
            category: {
              FIRE: {
                count: 1,
                commit_time: random(),
              },
              EMS: {
                count: 2,
                commit_time: random(),
              }
            }
          }
        }, {
          id: 'Tuesday',
          id_data: {
            count: random(),
            commit_time_sum: random(),
          },
          group_by_data: {
            category: {
              FIRE: {
                count: random(),
                commit_time: random(),
              },
              EMS: {
                count: random(),
                commit_time: random(),
              }
            }
          }
        }]
      })
    }
  //});
}
