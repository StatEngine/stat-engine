import _ from 'lodash';
import connection from '../../elasticsearch/connection';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { _formatAlerts } from './email.controller';
import { TimeUnit } from '../../components/constants/time-unit';
import { InternalServerError } from '../../util/error';

function mockElasticSearch() {
  connection.getClient = () => {
    return {
      msearch: () => {
        console.log('Hello from elasticsearch mock');
        return Promise.resolve(elasticSearchMockResponse());
      },
    };
  };
}

function elasticSearchMockResponse() {
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

function reportOptions() {
  const options = { timeUnit: TimeUnit.Day };
  // Set defautls
  if (_.isUndefined(options.showPercentChange)) {
    options.showPercentChange = true;
  } else {
    options.showPercentChange = false;
  }

  if (_.isUndefined(options.showUtilization)) {
    options.showUtilization = true;
  } else {
    options.showUtilization = false;
  }

  // Override day reports to use shift time.
  if (options.timeUnit.toLowerCase() === TimeUnit.Day) {
    options.timeUnit = TimeUnit.Shift;
  }

  if (_.isNil(options)) {
    throw new InternalServerError('No report options found!');
  }
  console.log('report options', options);
  return options;
}

describe('Email Notification Formatter', () => {
  beforeEach(() => {
    mockElasticSearch();
  });


  it('should execute without errors', async () => {
    const analysis = new IncidentAnalysisTimeRange({
      timeRange: 'test_time_range',
      index: 'test-index',
    });

    const ruleAnalysis = await analysis.eventDurationSumRuleAnalysis();
    console.log('rule analysis', ruleAnalysis);

    const globalMergeVars = [
      {},
      {},
      _formatAlerts(ruleAnalysis, reportOptions()),
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ];
    console.log('merge vars', JSON.stringify(globalMergeVars));


    const mergeVars = globalMergeVars.slice(0);
    mergeVars.push({
      name: 'user',
      content: {
        isExternal: 'YES',
      },
    });
    console.log('merge vars', JSON.stringify(mergeVars));
  });
});
