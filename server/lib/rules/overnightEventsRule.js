import _ from 'lodash';
import bodybuilder from 'bodybuilder';
import { Rule } from '../rule';

export class OvernightEventsRule extends Rule {
  constructor(params) {
    super(params);
    this.params.threshold = this.params.threshold || 7200;
    this.params.level = 'DANGER';
    this.reportChunkSize = 5;
    this.unitRespondingCountThreshold = 2;


    this.query = bodybuilder()
      .filter('term', 'description.suppressed', false)
      .orFilter('range', 'description.hour_of_day', { gte: 22 })
      .orFilter('range', 'description.hour_of_day', { gte: 0, lt: 6 })
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 500 }, unitAgg => unitAgg
          .aggregation('sum', 'apparatus.extended_data.event_duration')));
  }

  analyze() {
    // TODO move the constant to the constructor
    // eslint-disable-next-line camelcase
    const default_visibility = true;
    const rule = this.constructor.name;
    const level = this.params.level;
    const analysis = [];
    const detailsUtilizationMinutes = [];
    const detailsUtilizationCount = [];

    this.results.aggregations.apparatus['agg_terms_apparatus.unit_id'].buckets.forEach(unit => {
      const utilization = unit['agg_sum_apparatus.extended_data.event_duration'].value;

      const count = unit.doc_count;

      if (utilization > this.params.threshold) {
        detailsUtilizationMinutes.push({ detail: `${unit.key}/${(utilization / 60.0).toFixed(2)}` });
      }

      if (count > this.unitRespondingCountThreshold) {
        detailsUtilizationCount.push({ detail: `${unit.key}/${count}` });
      }
    });

    // TODO reuse
    let description = `Unit utilization > ${(this.params.threshold / 60.0).toFixed(0)} min overnight`;
    _.chunk(detailsUtilizationMinutes, this.reportChunkSize).forEach(detail => {
      analysis.push({
        rule,
        level,
        description,
        default_visibility,
        detailList: detail,
      });
    });

    // TODO reuse
    description = 'Unit response > 2 overnight';
    _.chunk(detailsUtilizationCount, this.reportChunkSize).forEach(detail => {
      analysis.push({
        rule,
        level,
        description,
        default_visibility,
        detailList: detail,
      });
    });

    return analysis;
  }
}

export default { OvernightEventsRule };
