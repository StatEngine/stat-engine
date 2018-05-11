import _ from 'lodash';
import Promise from 'bluebird';

import connection from '../../elasticsearch/connection';

const GRADE = {
  UNKNOWN: 'UNKNOWN',
  NEEDS_ATTENTION: 'NEEDS ATTENTION',
  GOOD: 'GOOD',
};

export function runNFPA(options) {
  const params = _.merge({
    index: options.index
  }, options.payload);

  const client = connection.getClient();

  return Promise.all([
    client[options.method](params)
      .then(res => options.parser(res, options))
  ])
    .then(responses => responses)
    .catch(err => console.error(err));
}

function getAction(rule, grade, value) {
  if(grade === GRADE.UNKNOWN) return 'Please contact us.';
  if(grade === GRADE.GOOD) return 'Keep up the good work!';

  return rule.action(value);
}

export const nfpa1710 = {
  method: 'search',
  rules: {
    /*alarm_answering_95: {
      category: 'Alarm Answering',
      description: 'Alarm answering time should be less than 15 secs, 95% of the time',
      grade: (val) => {
        if (_.isNaN(val) || !_.isNumber(val)) return GRADE.PASS;
        else if (val > 15) return GRADE.NEEDS_WORK;
        else return GRADE.PASS;
      },
      value: (res) => {
        const percents = _.get(res,'aggregations.alarm_answering.values');
        return percents ? percents['95.0'] : undefined;
      }
    },
    alarm_answering_99: {
      category: 'Alarm Answering',
      description: 'Alarm answering should be less than 40 secs, 99% of the time',
      grade: (val) => {
        if (_.isNaN(val) || !_.isNumber(val)) return GRADE.PASS;
        else if (val > 99) return GRADE.NEEDS_WORK;
        else return GRADE.PASS;
      },
      value: (res) => {
        const percents = _.get(res,'aggregations.alarm_answering.values');
        return percents ? percents['99.0'] : undefined;
      }
    },*/
    alarm_processing_90: {
      category: 'Alarm Processing',
      description: 'Alarm processing time should be less than 64 secs, 90% of the time',
      grade: val => {
        if(_.isNaN(val) || !_.isNumber(val)) return GRADE.UNKNOWN;
        else if(val > 64) return GRADE.NEEDS_ATTENTION;
        else return GRADE.GOOD;
      },
      value: res => {
        const percents = _.get(res, 'aggregations.alarm_processing.values');
        return percents ? percents['90.0'] : undefined;
      },
      action: val => `Can you trim ${(val - 64).toFixed(0)} seconds?`
    },
    alarm_processing_95: {
      category: 'Alarm Processing',
      description: 'Alarm processing time should be less than 106 secs, 95% of the time',
      grade: val => {
        if(_.isNaN(val) || !_.isNumber(val)) return GRADE.UNKNOWN;
        else if(val > 106) return GRADE.NEEDS_ATTENTION;
        else return GRADE.GOOD;
      },
      value: res => {
        const percents = _.get(res, 'aggregations.alarm_processing.values');
        return percents ? percents['95.0'] : undefined;
      },
      action: val => `Can you trim ${(val - 106).toFixed(0)} seconds?`
    },
    first_engine_arrival_90: {
      category: 'Travel Time',
      description: 'First engine travel time to a fire suppression incident should be less than 240 secs, 90% of the time',
      grade: val => {
        if(_.isNaN(val) || !_.isNumber(val)) return GRADE.UNKNOWN;
        else if(val > 90) return GRADE.NEEDS_ATTENTION;
        else return GRADE.GOOD;
      },
      value: res => {
        const buckets = _.get(res, 'aggregations.first_engine_travel_time.buckets');
        if(!buckets) return undefined;

        const fireIncidents = _.find(buckets, b => b.key === 'FIRE');
        const percents = _.get(fireIncidents, 'percentiles.values');
        return percents ? percents['90.0'] : undefined;
      },
      action: val => `Can you trim ${(val - 240).toFixed(0)} seconds?`
    },
    fire_turnout_90: {
      category: 'Turnout Time',
      description: 'Turnout Time on fire incidents should be less than 90 secs, 90% of the time',
      grade: val => {
        if(_.isNaN(val) || !_.isNumber(val)) return GRADE.UNKNOWN;
        else if(val > 90) return GRADE.NEEDS_ATTENTION;
        else return GRADE.GOOD;
      },
      value: res => {
        const buckets = _.get(res, 'aggregations.turnout_durations_seconds.buckets');
        if(!buckets) return undefined;

        const fireIncidents = _.find(buckets, b => b.key === 'FIRE');
        const percents = _.get(fireIncidents, 'percentiles.values');
        return percents ? percents['90.0'] : undefined;
      },
      action: val => `Can you trim ${(val - 90).toFixed(0)} seconds?`
    },
    ems_turnout_90: {
      category: 'Turnout Time',
      description: 'Turnout time on EMS incidents should be less than 60 secs , 90% of the time',
      grade: val => {
        if(_.isNaN(val) || !_.isNumber(val)) return GRADE.UNKNOWN;
        else if(val > 90) return GRADE.NEEDS_ATTENTION;
        else return GRADE.GOOD;
      },
      value: res => {
        const buckets = _.get(res, 'aggregations.turnout_durations_seconds.buckets');
        if(!buckets) return undefined;

        const fireIncidents = _.find(buckets, b => b.key === 'EMS');
        const percents = _.get(fireIncidents, 'percentiles.values');
        return percents ? percents['90.0'] : undefined;
      },
      action: val => `Can you trim ${(val - 60).toFixed(0)} seconds?`
    },
  },
  payload: {
    body: {
      size: 0,
      query: {
        bool: {
          must: {
            exists: {
              field: 'NFPA'
            }
          },
          must_not: {
            term: {
              'description.suppressed': true
            }
          }
        }
      },
      aggs: {
        alarm_answering: {
          percentiles: {
            field: 'NFPA.alarm_answering_duration_seconds',
            percents: [95, 99]
          }
        },
        alarm_processing: {
          percentiles: {
            field: 'NFPA.alarm_processing_duration_seconds',
            percents: [90, 95]
          }
        },
        turnout_durations_seconds: {
          terms: {
            field: 'NFPA.type'
          },
          aggs: {
            percentiles: {
              percentiles: {
                field: 'NFPA.turnout_durations_seconds',
                percents: [90]
              }
            }
          }
        },
        first_engine_travel_time: {
          terms: {
            field: 'NFPA.type'
          },
          aggs: {
            percentiles: {
              percentiles: {
                field: 'NFPA.first_engine_travel_duration_seconds',
                percents: [90]
              }
            }
          }
        }
      }
    },
  },
  parser: (res, options) => {
    /* Res.aggegrations =
    {
      alarm_answering: { values: { '95.0': 'NaN', '99.0': 'NaN' } },
      alarm_processing: { values: { '90.0': 129, '95.0': 156.25 } },
      turnout_durations_seconds: {
        doc_count_error_upper_bound: 0,
        sum_other_doc_count: 0,
        buckets: [ [Object], [Object], [Object] ] },
      ....
    }*/

    let rules = {};

    _.forEach(options.rules, (rule, key) => {
      let value = rule.value(res);
      let grade = rule.grade(value);
      rules[key] = {
        value: value.toFixed(2),
        category: rule.category,
        description: rule.description,
        grade,
        action: getAction(rule, grade, value)
      };
    });
    return {
      totalHits: _.get(res, 'hits.total'),
      rules: rules,
    };
  }
};
