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
      controllerAs: 'vm',
      resolve: {
        // heartbeat is used to ensure CSRF token is set
        heartbeat($http) {
          $http.post('/heartbeat', {});
        }
      },
    })
    .state('site.account.signup', {
      url: '/signup',
      template: require('./signup/signup.html'),
      controller: 'SignupController',
      controllerAs: 'vm',
      resolve: {
        fireDepartments(FireDepartment) {
          return FireDepartment.query().$promise;
        }
      },
    })
    .state('site.account.resetpassword', {
      url: '/resetpassword/',
      template: require('./resetpassword/resetpass.html'),
      controller: 'ResetPasswordController',
      controllerAs: 'vm'
    })
    .state('site.account.updatepassword', {
      url: '/updatepassword?password_token',
      template: require('./updatepassword/updatepassword.html'),
      controller: 'UpdatePasswordController',
      controllerAs: 'vm'
    })
    .state('site.account.edituser', {
      url: '/edituser',
      template: require('./edituser/edituser.html'),
      controller: 'EditUserController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        }
      },
      controllerAs: 'vm'
    });
}
