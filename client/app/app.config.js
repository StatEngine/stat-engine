'use strict';

import angular from 'angular';

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

  // HACK: Mobile browsers will have overlaid chrome, which makes a body with 100vh act glitchy.
  // Just manually set the body height to match the window height, which will account for the extra chrome.
  fitBodyToWindow();
  angular.element(window).on('resize', fitBodyToWindow);
  function fitBodyToWindow() {
    angular.element('body').css({
      height: `${window.innerHeight}px`,
    });
  }
}

export default routeConfig;
