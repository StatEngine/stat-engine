import _ from 'lodash';

import { FirecaresLookup } from '@statengine/shiftly';

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
  const client = connection.getClient();

  const timeFilter = buildTimeFilter(FirecaresLookup[req.user.FireDepartment.firecares_id], 'daily', req.query.date);

  client.search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      size: 0,
      query: {
        bool: {
          must_not: {
            term: {
              'description.suppressed': true
            }
          },
          filter: {
            range: {
              'description.event_opened': {
                lt: timeFilter.end,
                gte: timeFilter.start,
              }
            }
          },
        },
      },
      aggs: {
        category: {
          terms: {
            field: 'description.category',
          }
        },
        totalResponses: {
          sum: {
            script: {
              lang: 'painless',
              inline: 'doc[\'description.units.keyword\'].length'
            }
          }
        },
        responseDuration: {
          percentile_ranks: {
            field: 'description.extended_data.response_duration',
            values: [360]
          }
        },
        eventDuration: {
          percentiles: {
            field: 'description.extended_data.event_duration',
            percents: [90]
          }
        },
        turnoutDuration: {
          percentiles: {
            field: 'description.extended_data.event_duration',
            percents: [90]
          }
        },
        apparatus: {
          nested: {
            path: 'apparatus'
          },
          aggs: {
            distance: {
              percentiles: {
                field: 'apparatus.distance',
                percents: [90]
              }
            },
            turnoutDuration: {
              percentiles: {
                field: 'apparatus.extended_data.turnout_duration',
                percents: [90]
              }
            },
            units: {
              terms: {
                field: 'apparatus.unit_id',
                size: 100
              },
              aggs: {
                turnoutDuration: {
                  percentiles: {
                    field: 'apparatus.extended_data.turnout_duration',
                    percents: [90]
                  }
                },
                totalDistance: {
                  sum: {
                    field: 'apparatus.distance'
                  }
                },
                totalEventDuration: {
                  sum: {
                    field: 'apparatus.extended_data.event_duration'
                  }
                }
              }
            },
          }
        }
      }
    }
  }).then(result => {
    const data = {
      timeFilter
    };

    const categoryBuckets = _.get(result, 'aggregations.category.buckets');

    data.incident = [
      //platoon: 'TODO',
      {
        name: 'Incidents',
        value: checkIfZero(_.get(result, 'hits.total'))
      }, {
        name: 'EMS Incidents',
        value: checkIfZero(categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'EMS'), 'doc_count') : undefined),
      }, {
        name: 'Fire Incidents',
        value: checkIfZero(categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'FIRE'), 'doc_count') : undefined),
      }, {
        name: 'Other Incidents',
        value: checkIfZero(categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'OTHER'), 'doc_count') : undefined),
      }, {
        name: 'Total Responses',
        value: checkIfZero(_.get(result, 'aggregations.totalResponses.value')),
      }, {
        name: 'Six Minute Response Percentage',
        value: checkIfZero(_.get(result, 'aggregations.responseDuration.values[\'360.0\']')),
      }, {
        name: '90% Percentile Turnout Duration',
        value: checkIfZero(_.get(result, 'aggregations.apparatus.turnoutDuration.values[\'90.0\']')),
      }, {
        name: '90% Percentile Distance Travelled',
        value: checkIfZero(_.get(result, 'aggregations.apparatus.distance.values[\'90.0\']')),
      }, {
        name: '90% Event Duration',
        value: checkIfZero(_.get(result, 'aggregations.eventDuration.values[\'90.0\']')),
      }
    ];

    data.unit = [];
    const unitBuckets = _.get(result, 'aggregations.apparatus.units.buckets');
    _.forEach(unitBuckets, u => {
      data.unit.push({
        name: u.key,
        totalCount: checkIfZero(_.get(u, 'doc_count')),
        utilization: checkIfZero(_.get(u, 'totalEventDuration.value') ? _.get(u, 'totalEventDuration.value') / 60 : undefined),
        distance: checkIfZero(_.get(u, 'totalDistance.value')),
        turnoutDuration90: checkIfZero(_.get(u, 'turnoutDuration.values[\'90.0\']')),
      });
    });

    res.json(data);
  })
    .catch(err => {
      console.dir(err);
      res.status(500).send();
    });
}
