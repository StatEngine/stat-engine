import { sendNotification } from './sendNotification';

/**
  In order to run this test set these env properties:
    export MANDRILL_TEST_API_KEY=...
    export TEST_EMAIL=...
 */

// eslint-disable-next-line no-undef
describe('sendNotification()', () => {
  // eslint-disable-next-line no-undef
  it('should send a real email', () => {
    const to = process.env.TEST_EMAIL;
    const subject = 'Arecibo message';
    const html = '<p>The <b>Arecibo message</b> is an <a href="/wiki/Interstellar_radio_message" title="Interstellar radio message">' +
      'interstellar radio message</a> carrying basic information about humanity and Earth that was sent to ' +
      '<a href="/wiki/Great_Globular_Cluster_in_Hercules" title="Great Globular Cluster in Hercules">' +
      'globular star cluster M13</a> in 1974.</p>';
    const test = true;
    const metadata = {};

    sendNotification(to, subject, html, test, metadata);
  });
});
