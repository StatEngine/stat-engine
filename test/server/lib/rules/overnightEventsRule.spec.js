import { expect } from 'chai';
import { OvernightEventsRule } from '../../../../server/lib/rules/overnightEventsRule';

function incident(unitName, duration, count) {
  return {
    'agg_sum_apparatus.extended_data.event_duration': { value: duration }, // in seconds
    key: unitName,
    doc_count: count,
  };
}

describe('OvernightEventsRule', () => {
  let rule;
  beforeEach(() => {
    const ruleParams = { threshold: 60, // 1 minute in seconds
    };
    const twoIncidentOverThreshold = {
      aggregations: {
        apparatus: {
          'agg_terms_apparatus.unit_id': {
            buckets: [
              incident('UNIT_000', ruleParams.threshold, 10),
              incident('UNIT_100', ruleParams.threshold * 10, 1),
              incident('UNIT_200', ruleParams.threshold * 100, 2),
              incident('UNIT_300', ruleParams.threshold * 100, 4),
              incident('UNIT_400', ruleParams.threshold * 100, 4),
              incident('UNIT_500', ruleParams.threshold * 100, 4),
              incident('UNIT_600', ruleParams.threshold * 100, 4),
              incident('UNIT_700', ruleParams.threshold, 20),
            ],
          },
        },
      },
    };
    rule = new OvernightEventsRule(ruleParams);
    rule.setResults(twoIncidentOverThreshold);
  });

  it('expects both reports to be consolidated', () => {
    expect(rule.analyze()).to.deep.equal([
      {
        condenseRendering: true,
        default_visibility: true,
        rule: 'OvernightEventsRule',
        level: 'DANGER',
        description: 'Unit utilization > 1 min overnight',
        detailList: [
          { detail: 'UNIT_100/10.00' },
          { detail: 'UNIT_200/100.00' },
          { detail: 'UNIT_300/100.00' },
          { detail: 'UNIT_400/100.00' },
          { detail: 'UNIT_500/100.00' },
        ],
      },
      {
        condenseRendering: true,
        default_visibility: true,
        rule: 'OvernightEventsRule',
        level: 'DANGER',
        description: 'Unit utilization > 1 min overnight',
        detailList: [
          { detail: 'UNIT_600/100.00' },
        ],
      },
      {
        condenseRendering: true,
        default_visibility: true,
        description: 'Unit response > 2 overnight',
        detailList: [
          { detail: 'UNIT_000/10' },
          { detail: 'UNIT_300/4' },
          { detail: 'UNIT_400/4' },
          { detail: 'UNIT_500/4' },
          { detail: 'UNIT_600/4' },
        ],
        level: 'DANGER',
        rule: 'OvernightEventsRule',
      },
      {
        condenseRendering: true,
        default_visibility: true,
        description: 'Unit response > 2 overnight',
        detailList: [
          { detail: 'UNIT_700/20' },
        ],
        level: 'DANGER',
        rule: 'OvernightEventsRule',
      },
    ]);
  });
});
