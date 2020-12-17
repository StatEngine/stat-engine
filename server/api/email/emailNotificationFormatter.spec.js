import IncidentAnalysisTimeRange from '../../lib/incidentAnalysisTimeRange';

describe('Email Notification Formatter', () => {
  it('should execute without errors', async () => {
    const analysis = new IncidentAnalysisTimeRange({
      // index: fireDepartment.es_indices['fire-incident'],
      // timeRange,
    });

    const ruleAnalysis = await analysis.eventDurationSumRuleAnalysis();
  });
});
