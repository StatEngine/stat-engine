'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('statEngine', {
    url: '/statEngine',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown"></navbar>'
      },
      'content@': {
        template: require('./landing/landing.html'),
        controller: 'StatEngineLandingController'
      },
    },
  });
}
