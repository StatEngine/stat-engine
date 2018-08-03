import { sendEmail } from './mandrill';
import 'chai/register-should';

describe('sendEmail()', () => {
  it('should send a test email', (done) => {
    sendEmail('joe.chop@prominentedge.com', 'Daily', {})
      .then(() => {
        console.info('Sent email');
      })
      .catch(e => console.error(e))
  });
});
