'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  constructor($state, $window, Principal) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.PrincipalService = Principal;

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

    this.dashboard = function() {
      this.$window.location.href = '/dashboard';
    };

    this.goto = function(state) {
      this.userDropDownActive = false;
      $state.go(state);
    }
  }
}

export default angular.module('directives.nav', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent,
    controllerAs: 'vm',
  })
  .name;
