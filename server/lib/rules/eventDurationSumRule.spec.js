import { expect } from 'chai';
import { EventDurationSumRule } from './eventDurationSumRule';

describe('EventDurationSumRule', () => {
  let rule;
  beforeEach(() => {
    const ruleParams = {
      threshold: 60, // 1 minute in seconds
    };
    const twoIncidentOverThreshold = {
      aggregations: {
        apparatus: {
          'agg_terms_apparatus.unit_id': {
            buckets: [{
              'agg_sum_apparatus.extended_data.event_duration':
                { value: ruleParams.threshold * 10 }, // in seconds
              key: 'UNIT_100', // unit ID
              doc_count: 1,
            },
            {
              'agg_sum_apparatus.extended_data.event_duration':
                { value: ruleParams.threshold * 100 }, // in seconds
              key: 'UNIT_200', // unit ID
              doc_count: 4, // 4 units responded
            },
            ],
          },
        },
      },
    };
    rule = new EventDurationSumRule(ruleParams);
    rule.setResults(twoIncidentOverThreshold);
  });

  it('expects two events over the threshold to be consolidated into one detailed event', () => {
    expect(rule.analyze()).to.deep.equal([{
      rule: 'EventDurationSumRule',
      level: 'DANGER',
      description: 'Unit utilization > 1 min summary',
      details: 'Unit: UNIT_100, Utilization: 10.00<br>Unit: UNIT_200, Utilization: 100.00',
      default_visibility: true,
    }]);
  });
});
