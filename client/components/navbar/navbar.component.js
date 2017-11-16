'use strict';
/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  menu = [{
    title: 'Home',
    state: 'main'
  }];

  isCollapsed = true;

  constructor(Auth, $scope, $state, $window) {
    'ngInject';

    $scope.currentUser = {};
    $scope.isLoggedIn = false;

    Auth.getCurrentUser()
      .then(user => {
        $scope.currentUser = user;
        $scope.isLoggedIn = Auth.isLoggedInSync();
      }, err => {
        console.error('Error fetching current user');
        console.error(err);
      });

    $scope.logout = function() {
      Auth.logout()
        .then(() => {
          $state.go('main', {}, { reload: true });
        })
        .catch(() => {
          $state.go('main', {}, { reload: true });
        });
    };

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
