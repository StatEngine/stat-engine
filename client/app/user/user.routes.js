'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.user', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.user.editpassword', {
      url: '/settings',
      template: require('./settings/settings.html'),
      data: {
        roles: ['user']
      },
      controller: 'SettingsController',
      controllerAs: 'vm',
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        }
      },
    })
    .state('site.user.requestAccess', {
      url: '/requestAccess',
      template: require('./request-access/request-access.html'),
      controller: 'RequestAccessController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        requestedFireDepartment(currentPrincipal, FireDepartment) {
          if(currentPrincipal.requested_firecares_id) {
            return FireDepartment.get({ id: currentPrincipal.requested_firecares_id});
          } else {
            return undefined;
          }
        },
        fireDepartments(requestedFireDepartment, FireDepartment) {
          if (!requestedFireDepartment) {
            return FireDepartment.query().$promise;
          }
          else {
            return undefined;
          }
        }
      },
      controllerAs: 'vm'
    })
    .state('site.user.gettingStarted', {
      url: '/gettingStarted',
      template: require('./getting-started/getting-started.html'),
      controller: 'GettingStartedController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      },
      controllerAs: 'vm'
    })
    .state('site.user.home', {
      url: '/home',
      template: require('./user-home/user-home.html'),
      controller: 'UserHomeController',
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        requestedFireDepartment(currentPrincipal, FireDepartment) {
          if(currentPrincipal.requested_firecares_id) {
            return FireDepartment.get({ id: currentPrincipal.requested_firecares_id});
          } else {
            return undefined;
          }
        },
        dataQuality(FireDepartment, currentPrincipal) {
          if(currentPrincipal.FireDepartment && currentPrincipal.FireDepartment.firecares_id) {
            return FireDepartment.dataQuality({ id: currentPrincipal.FireDepartment.firecares_id, type: 'fire-incident'});
          } else {
            return undefined;
          }
        },
        twitterExtensionConfiguration(currentPrincipal, ExtensionConfiguration) {
          if(currentPrincipal.FireDepartment) {
            return ExtensionConfiguration.get({ name: 'Twitter', limit: 1 }).$promise;
          } else {
            return undefined;
          }
        },
        tweets(twitterExtensionConfiguration, Twitter) {
          if(twitterExtensionConfiguration && twitterExtensionConfiguration.enabled) return Twitter.getTweets().$promise;
          else return [];
        },
      },
      controllerAs: 'vm'
    });
}
