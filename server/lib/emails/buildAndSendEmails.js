import moment from 'moment';
import _ from 'lodash';

import { Extension, ExtensionConfiguration, FireDepartment, User } from '../../sqldb';
import { queryUpdate, queryFindOne as findCustomEmailConfig } from '../../api/custom-email/custom-email.controller';
import { getCustomEmailHtml } from '../../api/email/getEmailHtmlController';
import sendNotification from '../../api/email/sendNotification';
import { description as descriptionSection } from './sections/description';
import getSectionFuncs from './getSectionFuncs';
import { getShiftTimeRange } from '../shift';
import getFireDepartment from './fireDepartment';
import { TimeUnit } from '../../components/constants/time-unit';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { getReportOptions, getEmailList } from './notificationEmailHelpers';

export async function handleCustomEmail(emailConfigId) {
  // console.dir(req.body);
  // console.log('BUILD CONTENT AND SEND');
  // const { emailConfigId } = req.body;
  const emailData = await findCustomEmailConfig(emailConfigId);
  return emailData;

  // const enabledEmails = await findCustomEmail(req.body);

  // emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  // const mergeVars = await buildMergeVars(emailData);

  // console.log('GOT MERGE VARS');
  // console.dir(mergeVars);

  // const html = await getCustomEmailHtml(mergeVars);

  // await Promise.all(sendEmails(emailData, mergeVars, html));

  // // finally, update last_sent time`
  // emailData.last_sent = moment().format();
  // return queryUpdate(emailData._id, emailData);
}

export function sendEmails(emailList, mergeVars, html) {
  const promises = emailList.map(email => {
    const to = email;
    const subject = mergeVars.description.title;
    return sendNotification(to, subject, html);
  });
  // const to = 'paul@prominentedge.com';
  // const subject = mergeVars.description.title;

  // const promises = [sendNotification(to, subject, html)];
  return promises;
}

async function buildMergeVars(emailData) {
  const extensionConfig = await ExtensionConfiguration.find({
    where: { fire_department__id: emailData.fireDepartment._id },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });

  const options = {
    logo: extensionConfig.config_json.logo,
    showPercentChange: true,
    showDistances: true,
    showTransports: false,
    sections: {},
  };

  // get the email content
  const mergeVars = await getMergeVars(emailData);

  // set the show option for each section
  mergeVars.sections.forEach(mv => {
    const showVarName = getShowVariableName(mv.name);
    options.sections[showVarName] = true;
  });

  mergeVars.options = options;
  mergeVars.description = await description(emailData);
  return mergeVars;
}

function getShowVariableName(mergeVarName) {
  let showVarName = capitalize(mergeVarName);
  if (mergeVarName === 'agencyResponsesSummary') {
    showVarName = capitalize('unitAgencySummary');
  }
  return `show${showVarName}`;
}

function capitalize(str) {
  if (typeof str !== 'string') {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export async function getMergeVars(params) {
  const sectionFuncs = getSectionFuncs();
  const promises = params.sections.map(section => {
    if (sectionFuncs[section.type]) {
      return sectionFuncs[section.type](params);
    }
    return null;
  });
  const mergeVars = await Promise.all(promises);
  return mergeVars;
  // const sectionFuncs = getSectionFuncs();
  // emailData.timeRange = getTimeRange(emailData);
  // let promises = emailData.sections.map(section => {
  //   if (sectionFuncs[section.type]) {
  //     return sectionFuncs[section.type](emailData);
  //   }
  //   return null;
  // });
  // promises = promises.map(p => p);
  // const mergeVars = await Promise.all(promises);

  // return { sections: mergeVars };
}

function getTimeRange(emailData) {
  const { by_shift: byShift } = emailData;
  const firecaresId = emailData.fireDepartment.firecares_id;

  if (byShift) {
    // return getShiftTimeRange(firecaresId, moment('2018-12-01').format());
    return getShiftTimeRange(firecaresId, moment().format());
  }

  const start = moment('2018-12-01').format();// emailData.last_sent;
  const end = moment('2018-12-05').format();// moment().format();
  return {
    start,
    end,
  };
}
