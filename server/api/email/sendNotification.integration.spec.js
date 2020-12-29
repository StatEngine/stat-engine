/* eslint-disable no-undef */
import 'chai/register-should';

import sendNotification from './sendNotification';
import HtmlReports from './htmlReports';
import config from '../../config/environment';

/**
  In order to run this test set these env properties:
    export MANDRILL_TEST_API_KEY=...
    export TEST_EMAIL=...
 */

describe('sendNotification()', () => {
  it.skip('should send a real email', async () => {
    const htmlReports = new HtmlReports(config.mailSettings.emailTemplatePath);
    const mergeVars = [
      {
        name: 'options',
        content: { sections: { showalertsummary: true } },
      },
      {
        name: 'alerts',
        content: [
          {
            rowColor: 'red',
            description: 'Unit utilization > 360 min',
            details: 'Unit: SP841, Utilization: 366.05',
          },
        ],
      },
    ];

    const to = process.env.TEST_EMAIL;
    const subject = 'Test email';
    const html = htmlReports.report(mergeVars);
    const test = true;
    const metadata = {};

    sendNotification(to, subject, html, test, metadata)
      .then(res => {
        console.log('SUCCESS');
        console.dir(res);
      })
      .catch(err => {
        console.log('ERROR');
        console.dir(err);
      });
  });
});
