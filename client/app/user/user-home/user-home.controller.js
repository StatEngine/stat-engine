'use strict';

import _ from 'lodash';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, $filter, currentPrincipal, requestedFireDepartment, dataQuality, tweets) {
    this.$filter = $filter;
    this.$window = $window;

    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;

    this.dataQuality = dataQuality;
    this.tweetCount = tweets.length;
    this.requestedFireDepartment = requestedFireDepartment;

    const hours = new Date().getHours();
    this.greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function() {
      this.$window.location.href = '/dashboard';
    };

    this.gettingStarted = [
      {
        status: this.fireDepartment !== undefined,
      },
      {
        status: _.get(this.fireDepartment, 'integration_complete', false),
      },
      {
        status: _.get(this.fireDepartment, 'integration_verified', false),
      },
    ];

    console.dir(this.gettingStarted)

    this.setupComplete = this.gettingStarted.every(t => t.status === true);
  }
}
