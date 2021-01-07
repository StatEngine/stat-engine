import { incidentTypeMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';
import getRuleAnalysis from '../getRuleAnalysis';

export default async function incidentTypeSummary(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  const comparison = await ruleAnalysis.compare();
  const options = {};
  return formatAggregateMetrics('incidentType', incidentTypeMetricConfigs, comparison, options);
}