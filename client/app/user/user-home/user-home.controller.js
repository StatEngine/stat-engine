'use strict';

import _ from 'lodash';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, $filter, $state, currentPrincipal, requestedFireDepartment, fireDepartments, User, Principal, segment) {
    this.$filter = $filter;
    this.$window = $window;
    this.$state = $state;

    this.principal = currentPrincipal;
    this.UserService = User;
    this.PrincipalService = Principal;
    this.segment = segment;
    
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

    this.dashboard = function(location) {
      this.segment.track(this.segment.events.APP_ACCESS, {
        app: 'dashboard',
        location: 'user-home'
      });
      this.$window.location.href = '/dashboard';
    };

    this.goto = function(state, appName) {
      this.userDropDownActive = false;

      if (appName) {
        this.segment.track(this.segment.events.APP_ACCESS, {
          app: appName,
          location: 'user-home'
        });
      }
      $state.go(state);
    }
  }
}
