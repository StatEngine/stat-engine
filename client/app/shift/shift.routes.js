'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.shift', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.shift.home', {
      url: '/shift',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./shift-home/shift-home.html'),
          controller: 'ShiftHomeController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      },
    });
}
