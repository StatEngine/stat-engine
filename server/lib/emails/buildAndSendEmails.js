import sendNotification from '../../api/email/sendNotification';
import getSectionFuncs from './getSectionFuncs';

export function sendEmails(emailList, mergeVars, html) {
  const promises = emailList.map(email => {
    const to = email;
    const subject = mergeVars.description.title;
    return sendNotification(to, subject, html);
  });
  return promises;
}

export async function getMergeVars(params) {
  const sectionFuncs = getSectionFuncs();
  let promises = params.sections.map(section => {
    if (sectionFuncs[section.type]) {
      return sectionFuncs[section.type](params);
    }
    return null;
  });
  promises = promises.filter(p => p);
  const mergeVars = await Promise.all(promises);
  return mergeVars;
}
