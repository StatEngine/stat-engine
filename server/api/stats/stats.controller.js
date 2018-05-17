import _ from 'lodash';

import connection from '../../elasticsearch/connection';

export function getStats(req, res) {
  const client = connection.getClient();
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
          }
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
        eventDuration: {
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
  }).then((result) => {
    const data = {};

    const categoryBuckets = _.get(result, 'aggregations.category.buckets');
    data.incident = [
      //platoon: 'TODO',
      {
        name: 'Incidents',
        value: _.get(result, 'hits.total'),
      }, {
        name: 'EMS Incidents',
        value: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'EMS'), 'doc_count') : undefined,
      }, {
        name: 'Fire Incidents',
        value: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'FIRE'), 'doc_count') : undefined,
      }, {
        name: 'Other Incidents',
        value: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'OTHER'), 'doc_count') : undefined,
      }, {
        name: 'Total Responses',
        value: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'OTHER'), 'doc_count') : undefined,
      }, {
        name: 'Six Minute Response Percentage',
        value: _.get(result, 'aggregations.apparatus.values[\'360.0\']'),
      }, {
        name: '90% Percentile Turnout Duration',
        value: _.get(result, 'aggregations.turnoutDuration.values[\'90.0\']'),
      }, {
        name: '90% Percentile Distance Travelled',
        value: _.get(result, 'aggregations.distance.values[\'90.0\']'),
      }, {
        name: '90% Event Duration',
        value: _.get(result, 'aggregations.eventDuration.values[\'90.0\']'),
      }
    ]

    data.unit = [];
    const unitBuckets = _.get(result, 'aggregations.apparatus.units.buckets');
    _.forEach(unitBuckets, (u) => {
      data.unit.push({
        name: u.key,
        totalCount: _.get(u, 'doc_count'),
        utilization: _.get(u, 'totalEventDuration.value'),
        distance: _.get(u, 'totalDistance.value'),
        turnoutDuration90: _.get(u, 'turnoutDuration.values[\'90.0\']'),
      });
    });

    res.json(data);

  }).catch((err) => {
    console.dir(err)
    res.status(500).send();
  });
}
