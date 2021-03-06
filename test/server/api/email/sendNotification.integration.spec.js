/* eslint-disable no-undef */
import 'chai/register-should';
import handlebars from 'handlebars';
import sendNotification from '../../../../server/api/email/sendNotification';
import HtmlReports from '../../../../server/api/email/htmlReports';
import config from '../../../../server/config/environment';
import HandlebarsEmailTemplate from '../../../../server/api/email/templates/handlebarsEmailTemplate';

/**
  In order to run this test set these env properties:
    export MANDRILL_TEST_API_KEY=...
    export TEST_EMAIL=...
 */

describe('sendNotification()', () => {
  it.skip('should send a real email', async () => {
    const htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
      handlebars,
      config.mailSettings.emailShellTemplatePath,
      config.mailSettings.emailPartialsTemplatePath,
    ).template());

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
            detailList: [{ detail: 'SP841/366.05' }],
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
