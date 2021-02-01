import { getReportOptions, getEmailList } from './notificationEmailHelpers';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { getMergeVars, sendEmails } from './buildAndSendEmails';
import descriptionSection from './sections/description';
import { getEmailHtml } from '../../api/email/getEmailHtmlController';

export default async function handleNotificationEmail(emailConfigId, startDate, endDate, previous, fireDepartment) {
  const reportOptions = await getReportOptions(emailConfigId, fireDepartment._id);

  const timeRange = calculateTimeRange({
    startDate,
    endDate,
    timeUnit: reportOptions.timeUnit,
    firecaresId: fireDepartment.firecares_id,
    previous,
  });

  const analysis = new IncidentAnalysisTimeRange({
    index: fireDepartment.es_indices['fire-incident'],
    timeRange,
  });

  const comparison = await analysis.compare();
  const ruleAnalysis = await analysis.ruleAnalysis();

  const sections = getNotificationEmailSections();

  const params = {
    comparison,
    fireDepartment,
    reportOptions,
    ruleAnalysis,
    sections,
    timeRange,
  };

  const sectionData = await getMergeVars(params);

  const description = descriptionSection(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);

  const mergeVars = {
    description,
    options: reportOptions,
    sections: sectionData,
  };
  const emailList = await getEmailList(reportOptions, fireDepartment._id);

  const html = await getEmailHtml(mergeVars);

  await Promise.all(sendEmails(emailList, mergeVars, html));

  return html;
}

function getNotificationEmailSections() {
  return [
    { type: 'agencyIncidentTypeSummary' },
    { type: 'agencySummary' },
    { type: 'alertSummary' },
    { type: 'battalionSummary' },
    { type: 'incidentSummary' },
    { type: 'incidentTypeSummary' },
    { type: 'jurisdictionSummary' },
    { type: 'unitSummary' },
  ];
}
