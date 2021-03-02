import _ from 'lodash';

export default function formatAggregateMetrics(key, metricConfigs, comparison, options) {
  const keyName = `${key}Metrics`;
  const mergeVar = initMergeVar(`${key}Summary`, keyName);

  _.forEach(comparison[key], (metrics, id) => {
    const obj = { id };
    metricConfigs.forEach(metricConfig => {
      const [path, condition] = metricConfig;

      const data = _.get(metrics, path);

      if (!condition || (condition && _.get(options, condition))) {
        obj[path] = _.merge({}, data);
      }
    });

    mergeVar[keyName].push(obj);
  });

  mergeVar[keyName] = _.sortBy(mergeVar[keyName], [o => _.get(o, 'incidentCount.val')]).reverse();
  mergeVar[keyName] = _.filter(mergeVar[keyName], o => _.get(o, 'incidentCount.val') !== 0);

  return mergeVar;
}

function initMergeVar(name, keyName) {
  const mergeVar = { name };
  mergeVar[keyName] = [];
  return mergeVar;
}
