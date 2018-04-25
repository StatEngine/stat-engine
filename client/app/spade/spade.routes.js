'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('spadeLanding', {
    url: '/spade',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown"></navbar>'
      },
      'content@': {
        template: require('./landing/landing.html'),
        controller: 'SpadeLandingController',
        controllerAs: 'vm'
      },
    },
  });

  $stateProvider.state('spadeDocumentation', {
    url: '/spade/documentation',
    views: {
      'navbar@': {
        template: '<navbar class="animated fadeInDown"></navbar>'
      },
      'content@': {
        template: require('./documentation/documentation.html'),
        controller: 'SpadeDocumentationController',
        controllerAs: 'vm'
      },
    },
  });
}
