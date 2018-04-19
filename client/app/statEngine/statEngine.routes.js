'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('statEngine', {
    url: '/statEngine',
    template: require('./landing/landing.html'),
    controller: 'StatEngineLandingController'
  });

  $stateProvider.state('statEngineDocumentation', {
    url: '/statEngine/documentation',
    template: require('./documentation/documentation.html'),
    controller: 'StatEngineDocumentationController',
    controllerAs: 'vm'
  });
}
