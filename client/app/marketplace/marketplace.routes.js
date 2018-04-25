'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.marketplace', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown naked"></navbar>'
        },
        'content@': {
          template: '<div ui-view />'
        }
      },
    })
    .state('site.marketplace.home', {
      url: '/marketplace/home',
      views: {
        'content@': {
          template: require('./marketplace-home/marketplace-home.html'),
          controller: 'MarketplaceHomeController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        extensions(Extension) {
          return Extension.query().$promise;
        }
      },
    })
    .state('site.marketplace.extension', {
      url: '/marketplace/extension?name',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown"></navbar>'
        },
        'content@': {
          template: require('./extension/extension.html'),
          controller: 'ExtensionController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentExtension($stateParams, Extension) {
          return Extension.get({ name: $stateParams.name, limit: 1 }).$promise;
        },
        currentExtensionConfiguration($stateParams, ExtensionConfiguration) {
          return ExtensionConfiguration.get({ name: $stateParams.name, limit: 1 }).$promise;
        }
      },
    });
}
