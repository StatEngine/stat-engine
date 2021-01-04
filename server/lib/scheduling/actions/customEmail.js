import { buildEmailContentAndSend } from '../../customEmails/buildSectionsContentAndSend';

import Action from './action';

class CustomEmail extends Action {
  constructor(options) {
    super(options);
  }

  run() {
    buildEmailContentAndSend(this.options);
  }
}

export default CustomEmail;
