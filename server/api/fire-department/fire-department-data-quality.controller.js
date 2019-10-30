import _ from 'lodash';
import Promise from 'bluebird';

import connection from '../../elasticsearch/connection';

const noActionMessage = 'No action required.';
const qaGradeStops = [10, 33];

export async function runQA(options) {
  const params = _.merge({
    index: options.index
  }, options.payload);

  const client = connection.getClient();

  const responses = await Promise.all([
    client.count({ index: options.index })
      .then(res => res.count),
    client[options.method](params)
      .then(res => options.parser(res, options))
  ]);

  const [total, results] = responses;
  results.totalDocuments = total;
  results.percentViolation = _.round(results.violations / total, 2);
  results.grade = gradeFromPercentage(results.percentViolation);
  return results;
}

export const noApparatus = {
  rule: 'Each incident must have at least one apparatus.',
  requiredAction: 'Notify the StatEngine team that incidents without units exist.',
  method: 'count',
  payload: {
    body: {
      query: {
        bool: {
          must_not: [
            {
              exists: {
                field: 'description.units'
              },
            }
          ],
          filter: {
            term: {
              'description.suppressed': false
            }
          }
        },
      },
    },
  },
  parser: (res, options) => ({
    violations: res.count,
    data: {},
    rule: options.rule,
    action: options.action,
    requiredAction: res.count ? options.requiredAction : noActionMessage,
  })
};

export const unTypedApparatus = {
  rule: 'Apparatus must have a known type.',
  requiredAction: 'Notify the StatEngine team of the types of apparatus for the following units:',
  method: 'search',
  payload: {
    body: {
      _source: ['apparatus.unit_id', 'apparatus.unit_type'],
      size: 100,
      query: {
        nested: {
          path: 'apparatus',
          query: {
            bool: {
              must_not: {
                exists: {
                  field: 'apparatus.unit_type',
                },
              },
            },
          },
        },
      },
    },
  },
  parser: (res, options) => {
    const unitRE = /^([A-Z]*)(\d*)/;
    const units = res.hits.hits.map(un => un._source.apparatus
      .filter(app => !app.unit_type)
      .map(app => unitRE.exec(app.unit_id)[1]));

    const apparatus = _.countBy(_.flattenDeep(units));
    return {
      data: { apparatus },
      violations: res.hits.total,
      rule: options.rule,
      action: options.action,
      requiredAction: res.hits.total ? `${options.requiredAction} ${_.join(_.keys(apparatus), ', ')}.` : noActionMessage,
    };
  }
};

export function gradeFromPercentage(score) {
  if(score === undefined) return 'UNKNOWN';
  return score <= qaGradeStops[0] ? 'GOOD' : score <= qaGradeStops[1] ? 'NEEDS ATTENTION' : 'POOR';
}

export function gradeQAResults(results) {
  const worstScore = _.max(_.toPairs(results).map(result => _.get(result[1], 'percentViolation', undefined)));
  return {
    grade: gradeFromPercentage(worstScore),
    results
  };
}
