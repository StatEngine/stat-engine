'use strict';

import _ from 'lodash';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, $filter, $state, segment, currentPrincipal, requestedFireDepartment, fireDepartments, tweets, User, Principal) {
    this.$filter = $filter;
    this.$window = $window;
    this.$state = $state;

    segment.identify(currentPrincipal._id, currentPrincipal);

    this.principal = currentPrincipal;
    this.UserService = User;
    this.PrincipalService = Principal;
    this.tweetCount = tweets.length;

    this.fireDepartment = currentPrincipal.FireDepartment;
    this.requestedFireDepartment = requestedFireDepartment;

    if(currentPrincipal.isAdmin) {
      this.fireDepartments = fireDepartments;
      this.assignedFireDepartment = _.find(this.fireDepartments, f => f._id === this.principal.fire_department__id);
    }

    const hours = new Date().getHours();
    this.greeting = hours < 12 ? 'Good Morning' : hours < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
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

    this.setupComplete = this.gettingStarted.every(t => t.status === true);

    this.setFireDepartment = function(fd) {
      this.principal.fire_department__id = fd._id;
      this.UserService.update({ id: this.principal._id }, this.principal).$promise
        .then(() => {
          this.PrincipalService.logout();
          this.$state.go('site.main.main');
        })
        .catch(err => {
          console.error('error switching fire departments');
          console.error(err);
        });
    };
  }
}
