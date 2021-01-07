import { battalionMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';
import getRuleAnalysis from '../getRuleAnalysis';

export default async function battalionSummary(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  const comparison = await ruleAnalysis.compare();
  const options = {};
  return formatAggregateMetrics('battalion', battalionMetricConfigs, comparison, options);
}
