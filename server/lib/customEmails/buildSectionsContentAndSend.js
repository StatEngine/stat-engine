import moment from 'moment';

import { Extension, ExtensionConfiguration, FireDepartment, User } from '../../sqldb';
import { queryUpdate } from '../../api/custom-email/custom-email.controller';
import { alertSummary } from './sections/alertSummary';
import { getEmailHtml } from '../../api/email/getEmailHtmlController';
import sendNotification from '../../api/email/sendNotification';
import { description } from './sections/description';

export async function getFireDepartment(fdId) {
  return FireDepartment.findOne({
    where: {
      fd_id: fdId,
    },
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails'],
    }],
  });
}

async function getMergeVars(emailData) {
  const sectionFuncs = { alertSummary };
  console.dir(emailData.sections);
  const end = moment().format();
  emailData.timeRange = {
    start: emailData.last_sent,
    end,
  };
  const promises = emailData.sections.map(section => {
    const { type } = section;
    return sectionFuncs[type](emailData);
  });

  return Promise.all(promises);
}

function sendEmails(emailData, subject, html) {
  const promises = emailData.fireDepartment.Users.map(u => {
    const to = u.email;
    return sendNotification(to, subject, html);
  });
  return promises;
}

export async function buildEmailContentAndSend(emailData) {
  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  const extensionConfig = await ExtensionConfiguration.find({
    where: { fire_department__id: emailData.fireDepartment._id },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });

  const options = {
    name: 'options',
    content: {
      logo: extensionConfig.config_json.logo,
      sections: {},
    },
  };

  // get the email content
  emailData.mergeVars = await getMergeVars(emailData);
  emailData.mergeVars.forEach(mv => {
    options.content.sections[mv.name] = true;
  });

  emailData.mergeVars.push(options);
  const descriptionVar = await description(emailData);
  const subject = descriptionVar.content.title;
  emailData.mergeVars.push(descriptionVar);

  const html = await getEmailHtml(emailData.mergeVars);

  await Promise.all(sendEmails(emailData, subject, html));

  // finally, update last_sent time
  emailData.last_sent = moment().format();
  await queryUpdate(emailData._id, emailData);

  return 'createCustomEmailContent';
}
