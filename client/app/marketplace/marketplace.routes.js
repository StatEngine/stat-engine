'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.marketplace', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.marketplace.home', {
      url: '/marketplace/home',
      template: require('./marketplace-home/marketplace-home.html'),
      controller: 'MarketplaceHomeController',
      data: {
        roles: ['user']
      },
      resolve: {
        extensions(Extension) {
          return Extension.query().$promise;
        }
      },
      controllerAs: 'vm'
    })
    .state('site.marketplace.extension', {
      url: '/marketplace/extension?name',
      template: require('./extension/extension.html'),
      controller: 'ExtensionController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentExtension($stateParams, Extension) {
          return Extension.get({ name : $stateParams.name, limit: 1 }).$promise;
        },
        currentExtensionConfiguration($stateParams, ExtensionConfiguration) {
          return ExtensionConfiguration.get({ name : $stateParams.name, limit: 1 }).$promise;
        }
      },
      controllerAs: 'vm'
    });
}
