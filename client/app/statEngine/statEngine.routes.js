'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('statEngine', {
    url: '/statEngine',
    template: require('./landing/landing.html'),
    controller: 'StatEngineLandingController'
  });
}
