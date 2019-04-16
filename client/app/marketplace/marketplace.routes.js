'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.marketplace', {
      abstract: true,
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
        apps(Apps) {
          return Apps.query().$promise;
        },
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
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        currentExtension($stateParams, Extension) {
          return Extension.get({ id: $stateParams.id }).$promise;
        },
        hasRequested($stateParams, Extension) {
          return Extension.hasRequested({ id: $stateParams.id }).$promise;
        },
      },
    })
    .state('site.marketplace.applicationInstall', {
      url: '/marketplace/:id/applicationInstall',
      views: {
        'content@': {
          template: require('./application-install/application-install.html'),
          controller: 'ApplicationInstallController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        currentApp($stateParams, Apps) {
          return Apps.get({ id: $stateParams.id }).$promise;
        },
        appInstall($stateParams, Apps) {
          return Apps.status({ id: $stateParams.id }).$promise;
        },
      },
    });
}
