import sendNotification from './sendNotification';
import { toHtml } from './sendNotificationController';
/**
  In order to run this test set these env properties:
    export MANDRILL_TEST_API_KEY=...
    export TEST_EMAIL=...
 */

// eslint-disable-next-line no-undef
describe('sendNotification()', () => {
  // eslint-disable-next-line no-undef
  it('should send a real email', async () => {
    const mergeVars = [
      {
        name: 'options',
        content: {
          sections: {
            showalertsummary: true
          }
        }
      },
      {
        name: 'alerts',
        content: [
          {
            rowColor: 'red',
            description: 'Unit utilization > 360 min',
            details: 'Unit: SP841, Utilization: 366.05'
          }
        ]
      }
    ];

    const to = process.env.TEST_EMAIL;
    const subject = 'Test email';
    const html = toHtml(mergeVars);
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
