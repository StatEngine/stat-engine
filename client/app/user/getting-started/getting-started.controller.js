'use strict';

import _ from 'lodash';

export default class GettingStartedController {
  /*@ngInject*/
  constructor(currentPrincipal) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;

    this.gettingStarted = [
      // { step: 'Assigned Fire Department',
      //   status: _.isNumber(this.principal.fire_department__id),
      //   action: 'What department are you with?'
      // },
      { step: 'Connect your data.',
        status: _.get(this.fireDepartment, 'integration_complete', false),
        action: 'Contact our integration team at <a id=\'user-home-getting-started-connect-data-email\'\
          target="_blank" href="mailto:contact@statengine.io">contact@statengine.io</a> to learn how to integrate your data into StatEngine.'
      },
      { step: 'Verify your data.',
        status: _.get(this.fireDepartment, 'integration_verified', false),
        action: 'Visit your dashboard and confirm that everything looks good!'
      },
    ];

    this.setupComplete = this.gettingStarted.every(t => t.status === true);
  }
}
