import moment from 'moment';
import nodemailer from 'nodemailer';


import { FireDepartment, User } from '../../sqldb';
import { queryUpdate } from '../../api/custom-email/custom-email.controller';
import alertSummary from './sections/alertSummary';
import description from './sections/description';

async function getFireDepartment(fdId) {
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

async function getEmailContent(emailData) {
  const sectionFuncs = {
    alertSummary,
    description,
  };
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

async function sendEmails(emailData) {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: '8e9d8b26252da5',
      pass: 'a65bd89dada789',
    },
  });
  // send the email to each user
  const user = emailData.fireDepartment.Users[0];
  console.log('SEND EMAILS');
  console.dir(user.email);
  // emailData.fireDepartment.Users.forEach(u => {
  //   console.log(u.email);
  // });
  return 'sendEmails';
}

export default async function buildEmailContentAndSend(emailData) {
  console.log('buildEmailContentAndSend');
  // console.dir(emailData, { depth: null });

  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  // get the email content
  emailData.emailContent = await getEmailContent(emailData);

  // console.log('SECTIONS');
  // console.dir(emailData.emailContent, { depth: null });

  // send the emails
  await sendEmails(emailData);


  // finally, update last_sent time
  emailData.last_sent = moment().format();
  await queryUpdate(emailData._id, emailData);

  return 'createCustomEmailContent';
}
