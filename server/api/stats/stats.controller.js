import _ from 'lodash';

import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment-timezone';
import Promise from 'bluebird';
import connection from '../../elasticsearch/connection';

export function buildTimeFilter(ShiftConfig, type, date) {
  if(!ShiftConfig) throw new Error('No ShiftConfig found');
  const shiftly = new ShiftConfig();

  if(type === 'daily') return shiftly.shiftTimeFrame(date);
}

function checkIfZero(val) {
  return _.isNil(val) || _.isNaN(val) || val === 'NaN' ? 0 : val;
}

export function getStats(req, res) {
  const timeFilter = buildTimeFilter(FirecaresLookup[req.user.FireDepartment.firecares_id], 'daily', req.query.date);

  const queries = [{
    type: 'search',
    request: {
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
            filter: {
              range: {
                'description.event_opened': {
                  gte: timeFilter.start,
                  lt: timeFilter.end,
                }
              }
            }
          },
        },
        aggs: {
          incident_types: {
            terms: {
              field: 'description.category',
              size: 3,
              order: { _term: 'asc' }
            },
          },
          local_incident_types: {
            terms: {
              field: 'description.extended_data.AgencyIncidentCallTypeDescription.keyword',
              size: 300,
              order: { _term: 'asc' }
            },
          },
          response_time_percentile_rank: {
            percentile_ranks: {
              field: 'description.extended_data.response_duration',
              values: [360]
            }
          },
          address_battalions: {
            terms: {
              field: 'address.battalion',
              size: 50,
              order: { _term: 'asc' }
            }
          },
          event_duration_time_percentile_rank: {
            percentiles: {
              field: 'description.extended_data.event_duration',
              percents: [90]
            }
          }
        },
      }
    }
  },
  {
    type: 'search',
    request: {
      index: req.user.FireDepartment.get().es_indices['apparatus-fire-incident'],
      body: {
        size: 0,
        query: {
          bool: {
            must: {
              term: {
                'description.suppressed': false
              }
            },
            filter: {
              range: {
                'description.event_opened': {
                  gte: timeFilter.start,
                  lt: timeFilter.end,
                }
              }
            }
          }
        },
        aggs: {
          distance_percentile_rank: {
            percentiles: {
              field: 'apparatus_data.distance',
              percents: [90]
            }
          },
          turnout_percentile_rank: {
            percentiles: {
              field: 'apparatus_data.extended_data.turnout_duration',
              percents: [90]
            }
          },
          unit_responses: {
            terms: {
              field: 'apparatus_data.unit_id',
              size: 50,
              order: { utilization: 'desc' }
            },
            aggs: {
              total_distance: {
                sum: {
                  field: 'apparatus_data.distance'
                }
              },
              utilization: {
                sum: {
                  field: 'apparatus_data.extended_data.event_duration'
                }
              },
              turnout_percentile_rank: {
                percentiles: {
                  field: 'apparatus_data.extended_data.turnout_duration',
                  percents: [90]
                }
              },
              turnout_percentile_buckets: {
                percentiles: {
                  field: 'apparatus_data.extended_data.turnout_duration',
                  percents: [90]
                }
              },
              transports: {
                value_count: {
                  field: 'apparatus_data.unit_status.transport_started.timestamp'
                }
              },
              turnout_buckets: {
                terms: {
                  field: 'description.category',
                  size: 3,
                  order: { _term: 'asc' }
                },
                aggs: {
                  turnout_percentile_buckets: {
                    percentiles: {
                      field: 'apparatus_data.extended_data.turnout_duration',
                      percents: [90]
                    }
                  },
                }
              }
            }
          }
        }
      }
    }
  }
  ];


  queries.forEach(query => {
    const q = _.cloneDeep(query);

    const yesterday = {
      gte: moment.parseZone(timeFilter.start)
        .subtract(1, 'day')
        .format(),
      lt: moment.parseZone(timeFilter.end)
        .subtract(1, 'day')
        .format()
    };
    _.set(q, ['request', 'body', 'query', 'bool', 'filter', 'range', 'description.event_opened'], yesterday);

    queries.push(q);
  });

  return Promise.map(queries, query => connection.getClient()[query.type](query.request))
    .then(result => {
      const [today, todayApparatus, compDay, compApparatus] = result;

      const data = {
        timeFilter,
        incident: []
      };

      const categoryBuckets = day => _.get(day, 'aggregations.incident_types.buckets');
      const computeChange = (newVal, oldVal) => _.round((newVal - oldVal) / oldVal * 100, 2);

      const comps = [today, compDay];
      const compsApparatus = [todayApparatus, compApparatus];

      [
        ['Incidents', results => checkIfZero(_.get(results, 'hits.total')), comps],
        ['EMS Incidents', results => checkIfZero(categoryBuckets(results) ? _.get(_.find(categoryBuckets(results), u => u.key === 'EMS'), 'doc_count') : undefined), comps],
        ['Fire Incidents', results => checkIfZero(categoryBuckets(results) ? _.get(_.find(categoryBuckets(results), u => u.key === 'FIRE'), 'doc_count') : undefined), comps],
        ['Six Minute Response Percentage', results => checkIfZero(_.get(results, 'aggregations.response_time_percentile_rank.values[\'360.0\']')), comps],
        ['90% Percentile Turnout Duration', results => checkIfZero(_.get(results, 'aggregations.turnout_percentile_rank.values[\'90.0\']')), compsApparatus],
        ['90% Percentile Distance Travelled', results => checkIfZero(_.get(results, 'aggregations.distance_percentile_rank.values[\'90.0\']')), compsApparatus],
        ['90% Event Duration', results => checkIfZero(_.get(results, 'aggregations.event_duration_time_percentile_rank.values[\'90.0\']')), comps],
      ].forEach(metrics => {
        const [name, func, vals] = metrics;
        const [actual, comparison] = vals;

        data.incident.push({
          name,
          value: func(actual),
          change: computeChange(func(actual), func(comparison))
        });
      });

      data.unit = [];
      const unitBuckets = _.get(todayApparatus, 'aggregations.unit_responses.buckets');
      _.forEach(unitBuckets, u => {
        data.unit.push({
          name: u.key,
          totalCount: checkIfZero(_.get(u, 'doc_count')),
          transports: checkIfZero(_.get(u, 'transports.value_count')),
          utilization: checkIfZero(_.get(u, 'utilization.value') ? _.get(u, 'utilization.value') / 60 : undefined),
          distance: checkIfZero(_.get(u, 'total_distance.value')),
          turnoutDuration90: checkIfZero(_.get(u, 'turnout_percentile_buckets.values[\'90.0\']')),
        });
      });

      res.json(data);
    })
    .catch(err => {
      console.dir(err);
      res.status(500).send();
    });
}
