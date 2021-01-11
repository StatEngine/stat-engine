import buildEmailContentAndSend from '../../customEmails/buildEmailContentAndSend';

import Action from './action';

class CustomEmail extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.log('RUN BUILD EMAIL CONTENT AND SEND');
    buildEmailContentAndSend(this.options);
  }
}

export default CustomEmail;
