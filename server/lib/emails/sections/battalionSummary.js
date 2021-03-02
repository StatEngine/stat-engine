import { battalionMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function battalionSummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('battalion', battalionMetricConfigs, comparison, reportOptions);
}
