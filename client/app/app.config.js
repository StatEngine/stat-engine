'use strict';

export function routeConfig($urlRouterProvider, $locationProvider, $stateProvider) {
  'ngInject';

  $urlRouterProvider.otherwise('/home');

  $locationProvider.html5Mode(true);

  $stateProvider.state('site', {
    abstract: true,
    data: {
      roles: []
    },
    resolve: {
      authorize: ['Authorization',
        function(Authorization) {
          return Authorization.authorize();
        }
      ]
    },
    views: {
      'appbar@': {
        template: '<appbar></appbar>',
      },
      'sidebar@': {
        template: '<sidebar></sidebar>'
      },
    },
  });
}

export default routeConfig;
