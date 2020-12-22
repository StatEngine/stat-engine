import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import config from '../../config/environment';
import { Log } from '../../util/log';


/**
 * Send email.
 *
 * API documentation:
 * - [Mandrill Email Transport]{@link https://www.npmjs.com/package/nodemailer-mandrill-transport}
 * - [Mandrill Send Email]{@link https://mandrillapp.com/api/docs/messages.JSON.html#method=send}
 * @param to - The email recipient
 * @param subject - The email subject
 * @param html - The body of the email in HTML format
 * @param test - Indicate which email server key should be used. If set to ture, then a test key is used, otherwise a production key is used.
 * @param metadata - The email server user's metadata
 * @returns {*}
 */
function sendNotification(to, subject, html, test, metadata) {
  const apiKey = (test) ? config.mailSettings.mandrillTestAPIKey : config.mailSettings.mandrillAPIKey;
  if (!apiKey) {
    throw new Error('No mandrill api key set');
  }

  return nodemailer
    .createTransport(transport(apiKey))
    .sendMail(mailOptions(to, subject, html, metadata));
}

function transport(apiKey) {
  return mandrillTransport({ auth: { apiKey } });
}

function mailOptions(to, subject, html, metadata) {
  const options = {
    from: config.mailSettings.serverEmail,
    to,
    mandrillOptions: {
      message: {
        subject,
        html,
        metadata,
      },
    },

  };
  Log.debug('mandrillOptions', options);
  return options;
}

export default { sendNotification };
