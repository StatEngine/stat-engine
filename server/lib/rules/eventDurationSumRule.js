import bodybuilder from 'bodybuilder';
import { Rule } from '../rule';
import finalReportDetails from './finalReportDetails';

export class EventDurationSumRule extends Rule {
  constructor(params) {
    super(params);
    this.params.threshold = this.params.threshold || 7200;
    this.reportThreshold = this.params.threshold || 21600;
    this.reportChunkSize = 5;
    this.enrichment = {
      reportLevel: 'DANGER',
      reportRuleName: this.constructor.name,
      reportDefaultVisibility: true,
      reportDescription: `Unit utilization > ${(this.params.threshold / 60.0).toFixed(0)} min`,
    };

    this.query = bodybuilder()
      .filter('term', 'description.suppressed', false)
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 500 }, unitAgg => unitAgg
          .aggregation('sum', 'apparatus.extended_data.event_duration')));
  }

  analyze() {
    const details = [];

    this.results.aggregations.apparatus['agg_terms_apparatus.unit_id'].buckets.forEach(unit => {
      let utilization = unit['agg_sum_apparatus.extended_data.event_duration'].value;
      if (utilization > this.params.threshold) {
        utilization = (utilization / 60.0).toFixed(2);
        details.push({ detail: `${unit.key}/${utilization}` });
      }
    });

    return finalReportDetails(details, this.reportChunkSize, this.enrichment);
  }
}

export default { EventDurationSumRule };
