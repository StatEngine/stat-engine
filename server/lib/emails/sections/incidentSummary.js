import _ from 'lodash';

export default async function incidentSummary(params) {
  const { comparison, reportOptions } = params;
  return formatFireDepartmentMetrics(comparison, reportOptions);
}

function formatFireDepartmentMetrics(comparison, options) {
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
    const [label, path, condition] = metric;

    const data = _.get(comparison.fireDepartment, path);

    if (!condition || (condition && _.get(options, condition))) {
      mergeVar.content.push(_.merge({}, { label }, data));
    }
  });

  return mergeVar;
}
