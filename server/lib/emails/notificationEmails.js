import { getReportOptions } from './notificationEmailHelpers';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { getMergeVars } from './buildAndSendEmails';
import { description as descriptionSection } from './sections/description';
import { getCustomEmailHtml } from '../../api/email/getEmailHtmlController';
import { sendEmails } from './buildAndSendEmails';

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

  const sectionData = await getMergeVars({ sections, fireDepartment, timeRange, ruleAnalysis, comparison, reportOptions });

  const description = await descriptionSection(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);

  const mergeVars = {
    description,
    options: reportOptions,
    sections: sectionData,
  };
  const emailList = ['paul@prominentedge.com'];// await getEmailList(reportOptions, fireDepartment._id);

  console.log('handleNotificationEmail');
  console.dir(mergeVars.sections);

  const html = await getCustomEmailHtml(mergeVars);

  await Promise.all(sendEmails(emailList, mergeVars, html));

  return mergeVars;
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
