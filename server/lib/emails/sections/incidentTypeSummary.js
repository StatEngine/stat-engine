import { incidentTypeMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function incidentTypeSummary(params) {
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('incidentType', incidentTypeMetricConfigs, comparison, reportOptions);
}
