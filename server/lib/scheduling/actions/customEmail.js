import createCustomEmailContent from '../../customEmails/createCustomEmailContent';

import Action from './action';

class CustomEmail extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    console.info('Running CustomEmail Action');
    console.dir(this.options);
    createCustomEmailContent(this.options);
  }
}

export default CustomEmail;
