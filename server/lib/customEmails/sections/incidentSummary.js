import _ from 'lodash';

import { IncidentAnalysisTimeRange } from '../../incidentAnalysisTimeRange';

export default async function incidentSummary(emailData) {
  const index = emailData.fireDepartment.es_indices['fire-incident'];
  const incidentAnalysisTimeRangeParams = {
    index,
    timeRange: emailData.timeRange,
  };
  const analysis = new IncidentAnalysisTimeRange(incidentAnalysisTimeRangeParams);

  const comparison = await analysis.compare();

  return formatFireDepartmentMetrics(comparison);
}

function formatFireDepartmentMetrics(comparison) {
  const mergeVar = {
    name: 'fireDepartmentMetrics',
    fireDepartmentMetrics: [],
  };

  const metrics = [
    ['Total Incidents', 'incidentCount'],
    ['EMS Incidents', 'emsIncidentCount'],
    ['Fire Incidents', 'fireIncidentCount'],
    ['Total Responses', 'responses'],
    ['Six Minute Response Percentage', 'responseDurationPercentileRank360'],
    ['90% Distance to Incident (mi)', 'distanceToIncidentPercentile90', 'showDistances'],
    ['90% EMS Turnout Duration (sec)', 'emsTurnoutDurationPercentile90'],
    ['90% Fire Turnout Duration (sec)', 'fireTurnoutDurationPercentile90'],
    ['90% Event Duration (min)', 'eventDurationPercentile90'],
  ];

  metrics.forEach(metric => {
    const [label, path] = metric;
    const data = _.get(comparison.fireDepartment, path);
    mergeVar.content.push(_.merge({}, { label }, data));
  });

  return mergeVar;
}
