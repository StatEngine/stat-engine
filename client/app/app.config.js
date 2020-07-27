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
      'banner@': {
        template: '<subscription-banner></subscription-banner />'
      }
    },
  });

  // HACK: Mobile browsers will have overlaid chrome, which makes a body with 100vh act glitchy.
  // Just manually set the body height to match the window height, which will account for the extra chrome.
  fitBodyToWindow();
  angular.element(window).on('resize', fitBodyToWindow);
  angular.element(window).on('orientationchange', async () => {
    // Mobile devices will change their innerHeight at an undetermined time after the orientation change.
    // So wait up to 120 frames for a change to the window innerHeight, and then refit the body to the window.
    await new Promise(resolve => {
      const checkInnerHeightChanged = (framesWaited, prevHeight) => {
        if(window.innerHeight !== prevHeight || framesWaited >= 120) {
          resolve()
        } else {
          window.requestAnimationFrame(() => checkInnerHeightChanged(framesWaited + 1, prevHeight));
        }
      };
      checkInnerHeightChanged(0, window.innerHeight);
    });

    fitBodyToWindow();
  });

  function fitBodyToWindow() {
    angular.element('body').css({
      height: `${window.innerHeight}px`,
    });
  }
}

export default routeConfig;
