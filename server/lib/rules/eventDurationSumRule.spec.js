import { expect } from 'chai';
import { EventDurationSumRule } from './eventDurationSumRule';

function incident(unitName, duration) {
  return {
    'agg_sum_apparatus.extended_data.event_duration': { value: duration }, // in seconds
    key: unitName,
    doc_count: 1,
  };
}

describe('EventDurationSumRule', () => {
  let rule;
  beforeEach(() => {
    // 1 minute in seconds
    const ruleParams = { threshold: 60 };
    let threshold = ruleParams.threshold;
    const incidentOverThreshold = {
      aggregations: {
        apparatus: {
          'agg_terms_apparatus.unit_id':
            {
              buckets: [
                incident('UNIT_000', threshold),
                incident('UNIT_100', ++threshold),
                incident('UNIT_200', ++threshold),
                incident('UNIT_300', ++threshold),
                incident('UNIT_400', ++threshold),
                incident('UNIT_500', ++threshold),
                incident('UNIT_600', ++threshold),
                incident('UNIT_700', ++threshold),
                incident('UNIT_800', ++threshold),
              ],
            },
        },
      },
    };
    const incidentTwo = {
      'agg_sum_apparatus.extended_data.event_duration': { value: ruleParams.threshold * 100 }, // in seconds
      key: 'UNIT_200', // unit ID
      doc_count: 4, // 4 units responded
    };
    const twoIncidentOverThreshold = { aggregations: { apparatus: { 'agg_terms_apparatus.unit_id': { buckets: [incidentOne, incidentTwo] } } } };
    rule = new EventDurationSumRule(ruleParams);
    rule.setResults(incidentOverThreshold);
  });

  it('expects only events over the threshold', () => {
    // eslint-disable-next-line no-unused-vars
    const expectedReport = [{
      default_visibility: true,
      rule: 'EventDurationSumRule',
      level: 'DANGER',
      description: 'Unit utilization > 1 min',
      detailList: [
        { detail: 'UNIT_100/1.02' },
        { detail: 'UNIT_200/1.03' },
        { detail: 'UNIT_300/1.05' },
        { detail: 'UNIT_400/1.07' },
        { detail: 'UNIT_500/1.08' },
      ],
    },
    {
      default_visibility: true,
      rule: 'EventDurationSumRule',
      level: 'DANGER',
      description: 'Unit utilization > 1 min',
      detailList: [
        { detail: 'UNIT_600/1.10' },
        { detail: 'UNIT_700/1.12' },
        { detail: 'UNIT_800/1.13' },
      ],
    }];
    const report = rule.analyze();
    expect(report).to.deep.equal(expectedReport);
  });
});
