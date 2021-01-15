import _ from 'lodash';

/**
 * Creates a report by condensing of the original report. It creates chunks or arrays of details.
 * The final report is enriched with fields from the params parameter
 *
 * @param report report to be condensed and enriched
 * @param reportChunkSize determines how many reports are condensed to a single report
 * @param enrichment static values used to enrich the report
 * @returns {[]}
 */
export default function finalReportDetails(report, reportChunkSize, enrichment) {
  const analysis = [];

  _.chunk(report, reportChunkSize)
    .forEach(detail => {
      analysis.push({
        rule: enrichment.reportRuleName,
        level: enrichment.reportLevel,
        description: enrichment.reportDescription,
        default_visibility: enrichment.reportDefaultVisibility,
        detailList: detail,
      });
    });
  return analysis;
}
