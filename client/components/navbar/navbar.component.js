'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  constructor($state, Principal) {
    'ngInject';

    this.state = $state;
    this.Principal = Principal;
    this.currentPrincipal = undefined;

    Principal.identity().then((currentPrincipal) => {
      this.currentPrincipal = currentPrincipal;
    });

    this.logout = function() {
      this.Principal.logout()
        .finally(() => {
          $state.go('site.main.main');
        });
    }

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
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
