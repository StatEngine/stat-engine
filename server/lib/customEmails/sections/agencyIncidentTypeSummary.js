import { agencyIncidentTypeMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';
import getRuleAnalysis from '../getRuleAnalysis';

export default async function agencyIncidentTypeSummary(emailData) {
  const analysis = await getRuleAnalysis(emailData);
  const comparison = await analysis.compare();
  const options = {};
  return formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, comparison, options);
}
