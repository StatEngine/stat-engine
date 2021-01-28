import validateAggregateMetricsParams from '../validateAggregateMetricsParams';
import * as metricConfigs from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default function comparisonMetricSummary(type, params) {
  if (!validateAggregateMetricsParams(params)) {
    throw Error('Missing comparison or reportOptions');
  }
  const metricConfigKey = `${type}MetricConfigs`;
  const metricConfig = metricConfigs[metricConfigKey];
  if (!metricConfig) {
    throw Error(`No metric config for metric type: ${type}`);
  }

  const { comparison, reportOptions } = params;

  return formatAggregateMetrics(type, metricConfig, comparison, reportOptions);
}
