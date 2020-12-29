import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import config from '../../config/environment';
import { Log } from '../../util/log';

/**
 * Send email.
 *
 * Throws Error('No email server api key set') when the email server API key is not set in the environment
 *
 * API documentation:
 * - [Mandrill Email Transport]{@link https://www.npmjs.com/package/nodemailer-mandrill-transport}
 * - [Mandrill Send Email]{@link https://mandrillapp.com/api/docs/messages.JSON.html#method=send}
 * @param to - The email recipient
 * @param subject - The email subject
 * @param html - The body of the email in HTML format
 * @param test - Indicate which email server key should be used. If set to true, then a test key is used, otherwise a production key is used.
 * @param metadata - The email server user's metadata
 * @returns {*}
 */
export default function sendNotification(to, subject, html, test, metadata) {
  return nodemailer
    .createTransport(transport(apiKey(test)))
    .sendMail(mailOptions(to, subject, html, metadata))
}

function apiKey(test) {
  const key = (test) ? config.mailSettings.mandrillTestAPIKey : config.mailSettings.mandrillAPIKey;
  if (!key) {
    throw new Error('No email server api key set');
  }
  return key;
}

function transport(key) {
  return mandrillTransport({ auth: { apiKey: key } });
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
  return options;
}
