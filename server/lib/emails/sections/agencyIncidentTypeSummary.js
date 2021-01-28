import validateAggregateMetricsParams from '../validateAggregateMetricsParams';
import { agencyIncidentTypeMetricConfigs } from '../../../api/email/sendNotificationControllerConstants';
import formatAggregateMetrics from '../formatAggregateMetrics';

export default async function agencyIncidentTypeSummary(params) {
  if (!validateAggregateMetricsParams(params)) {
    // console.log('agencyIncidentTypeSummary BAD PARAM');
    // return 'Missing comparison or reportOptions';
    throw Error('Missing comparison or reportOptions');
  }
  const { comparison, reportOptions } = params;
  return formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, comparison, reportOptions);
}
