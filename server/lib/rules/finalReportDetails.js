import _ from 'lodash';

/**
 * Creates a report by condensing of the original report. It creates chunks or arrays of details.
 * The final report is enriched with fields from the params parameter
 *
 * @param report report to be condensed and enriched
 * @param reportChunkSize determines how many reports are condensed to a single report
 * @param enticements static values used to enrich the report
 * @returns {[]}
 */
export default function finalReportDetails(report, reportChunkSize, enticements) {
  const analysis = [];

  _.chunk(report, reportChunkSize)
    .forEach(detail => {
      analysis.push({
        rule: enticements.reportRuleName,
        level: enticements.reportLevel,
        description: enticements.reportDescription,
        default_visibility: enticements.reportDefaultVisibility,
        detailList: detail,
      });
    });
  return analysis;
}
