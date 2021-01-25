import { agencyIncidentTypeMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function agencyIncidentTypeSummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, comparison, reportOptions);
}
