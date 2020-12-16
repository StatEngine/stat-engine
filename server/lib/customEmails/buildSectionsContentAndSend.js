import moment from 'moment';
import { FireDepartment, User } from '../../sqldb';
import { queryUpdate } from '../../api/custom-email/custom-email.controller';

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
  return emailData.sections.map(section => {
    return section.type;
  });
}

async function sendEmails(emailData) {
  // send the email to each user
  emailData.fireDepartment.Users.forEach(u => {
    console.log(u.email);
  });
  return 'sendEmails';
}

export default async function buildEmailContentAndSend(emailData) {
  console.log('createCustomEmailContent');
  console.dir(emailData, { depth: null });

  emailData.fireDepartment = await getFireDepartment(emailData.fd_id);

  // get the email content
  emailData.emailContent = await getEmailContent(emailData);

  // send the emails
  await sendEmails(emailData);


  // finally, update last_sent time
  emailData.last_sent = moment().format();
  await queryUpdate(emailData._id, emailData);

  return 'createCustomEmailContent';
}
