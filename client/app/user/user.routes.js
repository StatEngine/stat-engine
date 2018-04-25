'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.user', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: '<div ui-view />'
        }
      },
    })
    .state('site.user.editpassword', {
      url: '/password',
      views: {
        'content@': {
          controller: 'SettingsController',
          controllerAs: 'vm',
          template: require('./settings/settings.html'),
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        }
      },
    })
    .state('site.user.requestAccess', {
      url: '/requestAccess',
      views: {
        'content@': {
          controller: 'RequestAccessController',
          controllerAs: 'vm',
          template: require('./request-access/request-access.html'),
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        requestedFireDepartment(currentPrincipal, FireDepartment) {
          if(currentPrincipal.requested_fire_department_id) {
            return FireDepartment.get({ id: currentPrincipal.requested_fire_department_id}).$promise;
          } else {
            return undefined;
          }
        },
        fireDepartments(requestedFireDepartment, FireDepartment) {
          if(!requestedFireDepartment) {
            return FireDepartment.query().$promise;
          } else {
            return undefined;
          }
        }
      },
    })
    .state('site.user.gettingStarted', {
      url: '/gettingStarted',
      views: {
        'content@': {
          controller: 'GettingStartedController',
          controllerAs: 'vm',
          template: require('./getting-started/getting-started.html'),
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      },
    })
    .state('site.user.home', {
      url: '/home',
      views: {
        'content@': {
          template: require('./user-home/user-home.html'),
          controller: 'UserHomeController',
          controllerAs: 'vm',
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        requestedFireDepartment(currentPrincipal, FireDepartment) {
          if(currentPrincipal.requested_fire_department_id) {
            return FireDepartment.get({ id: currentPrincipal.requested_fire_department_id}).$promise;
          } else {
            return undefined;
          }
        },
        fireDepartments(currentPrincipal, FireDepartment) {
          if(currentPrincipal.isAdmin) {
            return FireDepartment.query().$promise;
          } else {
            return undefined;
          }
        },
        /*twitterExtensionConfiguration(currentPrincipal, ExtensionConfiguration) {
          if(currentPrincipal.FireDepartment) {
            return ExtensionConfiguration.get({ name: 'Twitter', limit: 1 }).$promise;
          } else {
            return undefined;
          }
        },*/
        twitterExtensionConfiguration() {
          return undefined;
        },
        /*tweets(twitterExtensionConfiguration, Twitter) {
          if(twitterExtensionConfiguration && twitterExtensionConfiguration.enabled) return Twitter.getTweets().$promise;
          else return [];
        },*/
        tweets() {
          return [];
        }
      }
    })
    .state('site.user.settings', {
      url: '/settings',
      views: {
        'content@': {
          template: require('./user-settings/user-settings.html'),
          controller: 'UserSettingsController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        }
      },
    });
}
