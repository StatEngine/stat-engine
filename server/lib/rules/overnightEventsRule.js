import bodybuilder from 'bodybuilder';
import { Rule } from '../rule';
import finalReportDetails from './finalReportDetails';

export class OvernightEventsRule extends Rule {
  constructor(params) {
    super(params);
    this.reportLevel = 'DANGER';
    this.ruleName = this.constructor.name;
    this.reportChunkSize = 5;
    this.defaultVisibility = true;
    this.unitRespondingCountThreshold = 2;
    this.unitUtilTimeThreshold = this.params.threshold || 7200;

    this.utilizationMinutesReportParams = {
      reportLevel: this.reportLevel,
      reportRuleName: this.ruleName,
      reportDefaultVisibility: this.defaultVisibility,
      reportDescription: `Unit utilization > ${(this.params.threshold / 60.0).toFixed(0)} min overnight`,
    };

    this.utilizationCountReportParms = {
      reportLevel: this.reportLevel,
      reportRuleName: this.ruleName,
      reportDefaultVisibility: this.defaultVisibility,
      reportDescription: 'Unit response > 2 overnight',
    };

    this.query = bodybuilder()
      .filter('term', 'description.suppressed', false)
      .orFilter('range', 'description.hour_of_day', { gte: 22 })
      .orFilter('range', 'description.hour_of_day', { gte: 0, lt: 6 })
      .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
        .aggregation('terms', 'apparatus.unit_id', { size: 500 }, unitAgg => unitAgg
          .aggregation('sum', 'apparatus.extended_data.event_duration')));
  }

  /**
   * Performs two analyses, unit time utilization and number of units utilized
   *
   * @returns {*[]} unit utilization time and unit utilization count report
   */
  analyze() {
    const { utilMinReportDetails, utilCountReportDetails } =
      this.reportDetails(this.results, this.unitUtilTimeThreshold, this.unitRespondingCountThreshold);
    const utilMinReport = finalReportDetails(utilMinReportDetails, this.reportChunkSize, this.utilizationMinutesReportParams);
    const utilCountReport = finalReportDetails(utilCountReportDetails, this.reportChunkSize, this.utilizationCountReportParms);
    return utilMinReport.concat(utilCountReport);
  }

  /**
   * Performs two analyses using provided threshold, unit time utilization over the threshold
   *  and number of units utilized over the threshold
   * @param utilData data to be analyzed
   * @param utilMinThreshold utilization time threshold
   * @param utilCountThreshold utilization count threshold
   * @returns {{utilMinReportDetails: [], utilCountReportDetails: []}} unit utilization time and unit utilization count report
   */
  reportDetails(utilData, utilMinThreshold, utilCountThreshold) {
    const utilMinReportDetails = [];
    const utilCountReportDetails = [];

    utilData.aggregations.apparatus['agg_terms_apparatus.unit_id'].buckets.forEach(unit => {
      const utilization = unit['agg_sum_apparatus.extended_data.event_duration'].value;
      const count = unit.doc_count;
      if (utilization > utilMinThreshold) {
        utilMinReportDetails.push({ detail: `${unit.key}/${(utilization / 60.0).toFixed(2)}` });
      }
      if (count > utilCountThreshold) {
        utilCountReportDetails.push({ detail: `${unit.key}/${count}` });
      }
    });
    return {
      utilMinReportDetails,
      utilCountReportDetails,
    };
  }
}

export default { OvernightEventsRule };
