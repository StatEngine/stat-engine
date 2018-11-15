'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.marketplace', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<sidebar></sidebar>'
        },
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
    .state('site.marketplace.extensionRequest', {
      url: '/marketplace/:id/extensionRequest',
      views: {
        'content@': {
          template: require('./extension-request/extension-request.html'),
          controller: 'ExtensionRequestController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentExtension($stateParams, Extension) {
          return Extension.get({ id: $stateParams.id }).$promise;
        },
        hasRequested($stateParams, Extension) {
          return Extension.hasRequested({ id: $stateParams.id }).$promise;
        },
      },
    });
}
