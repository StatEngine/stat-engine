import moment from 'moment';

import { Extension, ExtensionConfiguration } from '../../sqldb';
import { queryUpdate } from '../../api/custom-email/custom-email.controller';
import { getCustomEmailHtml } from '../../api/email/getEmailHtmlController';
import sendNotification from '../../api/email/sendNotification';
import description from './sections/description';
import getSectionFuncs from './getSectionFuncs';
import { getShiftTimeRange } from '../shift';
import getFireDepartment from './fireDepartment';

export default async function buildEmailContentAndSend(emailData) {
  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  const mergeVars = await buildMergeVars(emailData);

  const html = await getCustomEmailHtml(mergeVars);

  await Promise.all(sendEmails(emailData, mergeVars, html));

  // finally, update last_sent time
  emailData.last_sent = moment().format();
  return queryUpdate(emailData._id, emailData);
}

function sendEmails(emailData, mergeVars, html) {
  const promises = emailData.fireDepartment.Users.map(u => {
    const to = u.email;

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
    sections: {},
  };

  // get the email content
  const mergeVars = await getMergeVars(emailData);
  mergeVars.sections.forEach(mv => {
    options.sections[mv.name] = true;
  });
  mergeVars.options = options;
  mergeVars.description = await description(emailData);
  return mergeVars;
}

async function getMergeVars(emailData) {
  const sectionFuncs = getSectionFuncs();
  emailData.timeRange = getTimeRange(emailData);
  console.log('timeRange');
  console.dir(emailData.timeRange);
  let promises = emailData.sections.map(section => {
    if (sectionFuncs[section.type]) {
      return sectionFuncs[section.type](emailData);
    }
    return null;
  });
  promises = promises.map(p => p);
  const mergeVars = await Promise.all(promises);


  return { sections: mergeVars };
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
