import _ from 'lodash';

export default function formatAggregateMetrics(key, metricConfigs, comparison, options) {
  const mergeVar = {
    name: `${key}Metrics`,
    content: [],
  };

  _.forEach(comparison[key], (metrics, id) => {
    const obj = { id };

    metricConfigs.forEach(metricConfig => {
      const [path, condition] = metricConfig;

      const data = _.get(metrics, path);

      if (!condition || (condition && _.get(options, condition))) {
        obj[path] = _.merge({}, data);
      }
    });

    mergeVar.content.push(obj);
  });

  mergeVar.content = _.sortBy(mergeVar.content, [o => _.get(o, 'incidentCount.val')]).reverse();
  mergeVar.content = _.filter(mergeVar.content, o => _.get(o, 'incidentCount.val') !== 0);

  return mergeVar;
}
