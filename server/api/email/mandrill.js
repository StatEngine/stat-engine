import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import util from 'util';

import config from '../../config/environment';

export function sendEmail(to, subject, templateName, merge_vars, test) {
  let apiKey;

  if(test) apiKey = config.mailSettings.mandrillTestAPIKey;
  else apiKey = config.mailSettings.mandrillAPIKey;

  if(!apiKey) return Promise.reject(new Error('No mandrill api key set'));

  const mailOptions = {};
  mailOptions.from = config.mailSettings.serverEmail;
  mailOptions.to = to;

  // Mailing service
  const mailTransport = nodemailer.createTransport(mandrillTransport({
    auth: {
      apiKey
    }
  }));

  mailOptions.mandrillOptions = {
    template_name: templateName,
    template_content: [],
    message: {
      subject,
      merge: true,
      merge_language: 'handlebars',
      global_merge_vars: merge_vars,
    }
  };

  console.log(util.inspect(mailOptions.mandrillOptions, {showHidden: false, depth: null}));

  return mailTransport.sendMail(mailOptions);
}

export default { sendEmail };
