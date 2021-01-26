import { unitMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function agencySummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('agencyResponses', unitMetricConfigs, comparison, reportOptions);
}
