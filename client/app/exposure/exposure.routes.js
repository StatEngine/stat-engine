'use strict';

let _;

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.exposure', {
      abstract: true,
    })
    .state('site.exposure.home', {
      url: '/exposure',
      views: {
        'content@': {
          template: require('./exposure-home/exposure-home.html'),
          controller: 'ExposureHomeController',
          controllerAs: 'vm'
        },
      }
    });
}
