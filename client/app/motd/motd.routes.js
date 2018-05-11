'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.motd', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.motd.home', {
      url: '/motd',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./motd-home/motd-home.html'),
          controller: 'MOTDHomeController',
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
