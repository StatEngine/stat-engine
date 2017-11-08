'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Home',
    state: 'main'
  }];

  isCollapsed = true;

  constructor(Auth, $scope, $window) {
    'ngInject';

    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;
    this.logout = Auth.logout;

    $scope.isLoggedIn = this.isLoggedIn();
    $scope.currentUser = this.getCurrentUser();
    $scope.logout = this.logout;

    $scope.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    $scope.dashboard = function() {
      $window.location.href = '/dashboard';
    };
  }
}

export default angular.module('directives.nav', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent
  })
  .name;
