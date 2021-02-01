import moment from 'moment';

import { queryUpdate, queryFindOne as findCustomEmailConfig } from '../../api/custom-email/custom-email.controller';
import { getMergeVars, sendEmails } from './buildAndSendEmails';
import getFireDepartment from './fireDepartment';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { getShiftTimeRange } from '../shift';
import { Extension, ExtensionConfiguration } from '../../sqldb';
import descriptionSection from './sections/description';
import { getCustomEmailHtml } from '../../api/email/getEmailHtmlController';

export default async function handleCustomEmail(emailConfigId) {
  const emailData = await findCustomEmailConfig(emailConfigId);
  const fireDepartment = await getFireDepartment(emailData.fd_id);

  const { by_shift: byShift, last_sent: lastSent } = emailData;
  const { firecaresId } = fireDepartment;
  const timeRange = getTimeRange(byShift, firecaresId, lastSent);

  const analysis = new IncidentAnalysisTimeRange({
    index: fireDepartment.es_indices['fire-incident'],
    timeRange,
  });
  const comparison = await analysis.compare();
  const ruleAnalysis = await analysis.ruleAnalysis();
  const { sections } = emailData;
  const reportOptions = await getReportOptions();

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

  const emailList = emailData.email_list;
  const html = await getCustomEmailHtml(mergeVars);

  await Promise.all(sendEmails(emailList, mergeVars, html));

  // finally, update last_sent time
  emailData.last_sent = moment().format();
  return queryUpdate(emailData._id, emailData);
}

function getTimeRange(byShift, firecaresId, lastSent) {
  if (byShift) {
    return getShiftTimeRange(firecaresId, moment().format());
  }

  const start = lastSent;
  const end = moment().format();
  return {
    start,
    end,
  };
}

async function getReportOptions(emailData) {
  const extensionConfig = await ExtensionConfiguration.find({
    where: { fire_department__id: emailData.fireDepartment._id },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });

  const reportOptions = {
    logo: extensionConfig.config_json.logo,
    sections: {
      showAgencyIncidentTypeSummary: true,
      showAlertSummary: true,
      showBattalionSummary: true,
      showIncidentTypeSummary: true,
      showJurisdictionSummary: true,
      showUnitAgencySummary: true,
    },
    showDistances: true,
    showTransports: true,
    showPercentChange: true,
    showUtilization: true,
  };

  return reportOptions;
}
