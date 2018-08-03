import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';

import config from '../../config/environment';

export function sendEmail(to, templateName, content) {
  if(!config.mailSettings.mandrillAPIKey) return Promise.reject({ error: 'No mandrill api key set'});

  const mailOptions = {};
  mailOptions.from = config.mailSettings.serverEmail;
  mailOptions.to = to;

  // Mailing service
  const mailTransport = nodemailer.createTransport(
    mandrillTransport({
      auth: {
        apiKey: config.mailSettings.mandrillAPIKey
      }
    })
  );

  mailOptions.mandrillOptions = {
    template_name: templateName,
    template_content: [],
    message: {
      merge: true,
      merge_language: 'handlebars',
      global_merge_vars: [{
        name: 'displayName',
        content: 'test454'
      }, {
        name: 'timeRange',
        content: 'Aug 1, 2018 7:00 AM - Aug 2, 2018 7:00 AM'
      }, {
        name: 'headerInfo',
        content: {
          asOf: '343'
        }
      }, {
        name: 'description',
        content: {
          body: "Testing global variablesaa",
          runtime: 'Aug 1, 2018 7:00 AM'
        }
      }, {
        name: 'incidentMetrics',
        content: [{
          label: 'Total Incidents',
          value: 3,
          change: 4
        }, {
          label: 'EMS Incidents',
          value: 42,
          change: -1
        }]
      }, {
        name: 'unitMetrics',
        content: [{
          unitId: 'E1',
          totalIncidents: {
            value: 23,
            change: -3
          },
          transports: {
            value: 4,
            change: 1
          }
        }, {
          unitId: 'E3',
          totalIncidents: {
            value: 13,
            change: -3
          },
          transports: {
            value: 45,
            change: 5
          }
        }]
      }]
    }
  };

  console.dir(mailOptions.mandrillOptions)

  return mailTransport.sendMail(mailOptions);
}
