import _ from 'lodash';
import bodybuilder from 'bodybuilder';
import { Rule } from '../rule';

export class EventDurationSumRule extends Rule {
  constructor(params) {
    super(params);
    this.params.threshold = this.params.threshold || 21600;
    this.params.level = 'DANGER';

    this.query = bodybuilder()
      .filter('term', 'description.suppressed', false)
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 500 }, unitAgg => unitAgg
          .aggregation('sum', 'apparatus.extended_data.event_duration')));
  }

  analyze() {
    // eslint-disable-next-line camelcase
    const default_visibility = true;
    const rule = this.constructor.name;
    const level = this.params.level;
    const reportChunkSize = 5;
    const description = `Unit utilization > ${(this.params.threshold / 60.0).toFixed(0)} min`;
    const analysis = [];
    let details = [];


    this.results.aggregations.apparatus['agg_terms_apparatus.unit_id'].buckets.forEach(unit => {
      let utilization = unit['agg_sum_apparatus.extended_data.event_duration'].value;
      if (utilization > this.params.threshold) {
        utilization = (utilization / 60.0).toFixed(2);
        details.push({ detail: `${unit.key}/${utilization}` });
      }
    });

    details = _.chunk(details, reportChunkSize).forEach(detail => {
      analysis.push({
        default_visibility,
        rule,
        level,
        description,
        detailList: detail,
      });
    });

    return analysis;
  }
}

export default { EventDurationSumRule };
