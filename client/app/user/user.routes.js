'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.user', {
      'abstract': true,
      template: '<div ui-view />'
    })
    .state('site.user.home', {
      url: '/home',
      template: require('./user-home/user-home.html'),
      controller: 'UserHomeController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal: function(Principal) {
          return Principal.identity();
        }
      },
      controllerAs: 'vm'
    })
}
