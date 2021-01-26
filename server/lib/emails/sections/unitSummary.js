import { unitMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function unitSummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('unit', unitMetricConfigs, comparison, reportOptions);
}
