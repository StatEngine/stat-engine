'use strict';

import _ from 'lodash';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, currentPrincipal, currentFireDepartment, dataQuality) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentFireDepartment;
    this.dataQuality = dataQuality;

    const date = new Date().getHours();
    this.greeting = date < 12 ? 'Good Morning' : date < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.gettingStarted = [
      // { step: 'Assigned Fire Department',
      //   status: _.isNumber(this.principal.fire_department__id),
      //   action: 'What department are you with?'
      // },
      { step: 'Connect your data.',
        status: _.get(this.fireDepartment, 'integration_complete', false),
        action: 'Contact our integration team at <a id=\'user-home-getting-started-connect-data-email\' target="_blank" href="mailto:contact@statengine.io">contact@statengine.io</a> to learn how to integrate your data into StatEngine.'
      },
      { step: 'Verify your data.',
        status: _.get(this.fireDepartment, 'integration_verified', false),
        action: 'Visit your dashboard and confirm that everything looks good!'
      },
      { step: 'Access your dashboard.',
        status: this.principal.roles.indexOf('kibana_admin') > -1,
        action: 'After your data integration is complete, we\'ll create a custom dashboard just for you!'
      },
    ];

    this.setupComplete = this.gettingStarted.every(t => t.status === true);

    this.dashboard = function() {
      $window.location.href = '/dashboard';
    };
  }
}
