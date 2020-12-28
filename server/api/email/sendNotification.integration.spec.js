/* eslint-disable no-undef */
import 'chai/register-should';
import handlebars from 'handlebars';
import sendNotification from './sendNotification';
import HtmlReports from './htmlReports';
import config from '../../config/environment';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';

/**
  In order to run this test set these env properties:
    export MANDRILL_TEST_API_KEY=...
    export TEST_EMAIL=...
 */

describe('sendNotification()', () => {
  // eslint-disable-next-line no-undef
  it('should send a real email', async () => {
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
    const html = await toHtml(mergeVars);
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
