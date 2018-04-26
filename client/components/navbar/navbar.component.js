'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  constructor($state, $window, Principal, segment) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.PrincipalService = Principal;
    this.segment = segment;

    this.userDropDownActive = false;

    this.currentPrincipal = undefined;
    this.PrincipalService.identity()
      .then(currentPrincipal => {
        this.currentPrincipal = currentPrincipal;
      });

    this.logout = function() {
      this.$state.go('site.main.main');
      this.PrincipalService.logout();
    };

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function(location) {
      this.segment.track(this.segment.events.APP_ACCESS, {
        app: 'dashboard',
        location
      });
      this.$window.location.href = '/dashboard';
    };

    this.goto = function(state, appName) {
      this.userDropDownActive = false;

      if(appName) {
        this.segment.track(this.segment.events.APP_ACCESS, {
          app: appName,
          location: 'navbar-dropdown'
        });
      }
      $state.go(state);
    };
  }
}

export default angular.module('directives.nav', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent,
    controllerAs: 'vm',
  })
  .name;
