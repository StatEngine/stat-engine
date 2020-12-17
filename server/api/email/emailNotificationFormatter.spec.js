import connection from '../../elasticsearch/connection';

import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';

function mockElasticSearch() {
  connection.getClient = () => {
    return {
      msearch: () => {
        console.log('Hello from elasticsearch mock');
        return Promise.resolve(elasticSearchMockResposne());
      },
    };
  };
}

function elasticSearchMockResposne() {
  const ruleParams = {
    threshold: 21600, // 6 hours in seconds, default threshold off EventDurationSumRule
  };
  const twoIncidentOverThreshold = {
    aggregations: {
      apparatus: {
        'agg_terms_apparatus.unit_id': {
          buckets: [{
            'agg_sum_apparatus.extended_data.event_duration':
              { value: ruleParams.threshold * 2 }, // in seconds
            key: 'UNIT_100', // unit ID
            doc_count: 1,
          },
          {
            'agg_sum_apparatus.extended_data.event_duration':
                { value: ruleParams.threshold * 3 }, // in seconds
            key: 'UNIT_200', // unit ID
            doc_count: 4, // 4 units responded
          },
          ],
        },
      },
    },
  };
  return { responses: [twoIncidentOverThreshold] };
}

describe('Email Notification Formatter', () => {
  beforeEach(() => {
    mockElasticSearch();
  });


  it('should execute without errors', async () => {
    const analysis = new IncidentAnalysisTimeRange({
      // index: fireDepartment.es_indices['fire-incident'],
      timeRange: 'test_time_range',
      index: 'test-index',
    });

    const ruleAnalysis = await analysis.eventDurationSumRuleAnalysis();
    console.log(ruleAnalysis);
  });
});
