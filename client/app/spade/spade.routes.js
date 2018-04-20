'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('spadeLanding', {
    url: '/spade',
    template: require('./landing/landing.html'),
    controller: 'SpadeLandingController',
    controllerAs: 'vm'
  });

  $stateProvider.state('spadeDocumentation', {
    url: '/spade/documentation',
    template: require('./documentation/documentation.html'),
    controller: 'SpadeDocumentationController',
    controllerAs: 'vm'
  });
}
