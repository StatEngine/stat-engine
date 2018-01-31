'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.account', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.account.login', {
      url: '/login',
      template: require('./login/login.html'),
      controller: 'LoginController',
      controllerAs: 'vm'
    })
    .state('site.account.signup', {
      url: '/signup',
      template: require('./signup/signup.html'),
      controller: 'SignupController',
      controllerAs: 'vm'
    });
}
