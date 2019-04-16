'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('statEngine', {
    url: '/statEngine',
    views: {
      'appbar@': {
        template: '',
      },
      'sidebar@': {
        template: '',
      },
      'content@': {
        template: require('./landing/landing.html'),
        controller: 'StatEngineLandingController'
      },
    },
  });
}
