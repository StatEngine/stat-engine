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
    let analysis = [];
    this.results.aggregations.apparatus['agg_terms_apparatus.unit_id'].buckets.forEach(unit => {
      let utilization = unit['agg_sum_apparatus.extended_data.event_duration'].value;

      if(utilization > this.params.threshold) {
        analysis.push({
          rule: this.constructor.name,
          level: this.params.level,
          description: `Unit utilization > ${(this.params.threshold / 60.0).toFixed(0)} min`,
          details: `Unit: ${unit.key}, Utilization: ${(utilization / 60.0).toFixed(2)}`,
          default_visibility: true,
        });
      }
    });

    return analysis;
  }
}

export default { EventDurationSumRule };
