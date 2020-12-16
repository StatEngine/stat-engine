import { IncidentAnalysisTimeRange } from '../incidentAnalysisTimeRange';

export default async function getRuleAnalysis(emailData) {
  const { timeRange } = emailData;
  const analysis = new IncidentAnalysisTimeRange({
    index: emailData.fireDepartment.es_indices['fire-incident'],
    timeRange,
  });

  return analysis.ruleAnalysis();
}
