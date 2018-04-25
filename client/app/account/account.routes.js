'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.account', {
      abstract: true,
      views: {
        'content@': {
          template: '<div ui-view />'
        }
      },
    })
    .state('site.account.login', {
      url: '/login',
      views: {
        'content@': {
          template: require('./login/login.html'),
          controller: 'LoginController',
          controllerAs: 'vm'
        }
      },
    })
    .state('site.account.signup', {
      url: '/signup',
      views: {
        'content@': {
          template: require('./signup/signup.html'),
          controller: 'SignupController',
          controllerAs: 'vm',
        }
      },
      resolve: {
        fireDepartments(FireDepartment) {
          return FireDepartment.query().$promise;
        }
      },
    })
    .state('site.account.resetpassword', {
      url: '/resetpassword/',
      views: {
        'content@': {
          template: require('./resetpassword/resetpass.html'),
          controller: 'ResetPasswordController',
          controllerAs: 'vm'
        }
      },
    })
    .state('site.account.updatepassword', {
      url: '/updatepassword?password_token',
      views: {
        'content@': {
          template: require('./updatepassword/updatepassword.html'),
          controller: 'UpdatePasswordController',
          controllerAs: 'vm'
        }
      },
    });
}
