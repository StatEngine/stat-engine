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
    template: '<div ui-view />'
  });
}

export default routeConfig;
