import moment from 'moment';
import nodemailer from 'nodemailer';


import { FireDepartment, User } from '../../sqldb';
import { queryUpdate } from '../../api/custom-email/custom-email.controller';
import { alertSummary } from './sections/alertSummary';
import { description } from './sections/description';
import { getEmailHtml } from '../../api/email/getEmailHtmlController';

export async function getFireDepartment(fdId) {
  return FireDepartment.findOne({
    where: { fd_id: fdId },
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails'],
    }],
  });
}

async function getMergeVars(emailData) {
  const sectionFuncs = {
    alertSummary,
    description,
  };
  console.dir(emailData.sections);
  const end = moment().format();
  emailData.timeRange = {
    start: emailData.last_sent,
    end,
  };
  const promises = emailData.sections.map(section => {
    return sectionFuncs[section.type](emailData);
  });

  return Promise.all(promises);
}

async function sendEmails(emailData) {
  // const transport = nodemailer.createTransport({
  //   host: 'smtp.mailtrap.io',
  //   port: 2525,
  //   auth: {
  //     user: '8e9d8b26252da5',
  //     pass: 'a65bd89dada789',
  //   },
  // });
  // send the email to each user
  const user = emailData.fireDepartment.Users[0];
  console.log('SEND EMAILS');
  console.dir(user.email);
  // emailData.fireDepartment.Users.forEach(u => {
  //   console.log(u.email);
  // });
  return 'sendEmails';
}

export async function buildEmailContentAndSend(emailData) {
  console.log('buildEmailContentAndSend');
  // console.dir(emailData, { depth: null });

  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  // get the email content
  emailData.mergeVars = await getMergeVars(emailData);
  console.log('MERGE VARS');
  console.dir(emailData.mergeVars);

  const html = await getEmailHtml(emailData.mergeVars);

  // console.log('GOT HTML');
  // console.log(html);


  // console.log('SECTIONS');
  // console.dir(emailData.emailContent, { depth: null });

  // send the emails
  await sendEmails(emailData);


  // finally, update last_sent time
  emailData.last_sent = moment().format();
  await queryUpdate(emailData._id, emailData);

  return 'createCustomEmailContent';
}
