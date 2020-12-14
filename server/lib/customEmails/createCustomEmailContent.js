import moment from 'moment';

export default async function createCustomEmailContent(emailData) {
  console.log('createCustomEmailContent');
  const startDate = moment().format();
  emailData.startDate = startDate;
  console.dir(emailData);
  return 'createCustomEmailContent';
}
