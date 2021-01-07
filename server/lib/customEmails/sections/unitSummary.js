import { unitMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';
import getRuleAnalysis from '../getRuleAnalysis';

export default async function unitSummary(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  const comparison = await ruleAnalysis.compare();
  const options = {};
  return formatAggregateMetrics('agencyResponses', unitMetricConfigs, comparison, options);
}
