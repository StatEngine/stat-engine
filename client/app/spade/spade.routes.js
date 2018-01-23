'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('spadeLanding', {
    url: '/spade',
    template: require('./spade-landing/spade-landing.html'),
    controller: 'SpadeLandingController',
    controllerAs: 'vm'
  });
}
