import { jurisdictionMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function jurisdictionSummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('jurisdiction', jurisdictionMetricConfigs, comparison, reportOptions);
}
