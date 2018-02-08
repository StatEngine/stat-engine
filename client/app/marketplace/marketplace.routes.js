'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider.state('marketplaceLanding', {
    url: '/marketplace',
    template: require('./landing-marketplace/landing-marketplace.html'),
    controller: 'MarketplaceLandingController'
  });

  $stateProvider.state('integrationExample', {
    url: '/marketplace/integration-example',
    template: require('./integration-example/integration-example.html'),
    controller: 'IntegrationExampleController',
    controllerAs: 'vm'
  });
}
