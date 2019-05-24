'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.user', {
      abstract: true,
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
    .state('site.user.help', {
      url: '/help',
      views: {
        'content@': {
          controller: 'HelpHomeController',
          controllerAs: 'vm',
          template: require('./help/help-home.html'),
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
          if(currentPrincipal.isGlobal) {
            return FireDepartment.query().$promise;
          } else {
            return undefined;
          }
        },
        safetyMessage(currentPrincipal, Safety) {
          if(currentPrincipal.FireDepartment) return Safety.getRandomMessage().$promise;
        },
        weatherForecast(currentPrincipal, Weather) {
          if(currentPrincipal.FireDepartment) return Weather.getForecast().$promise;
        },
        //todayStatSummary(currentPrincipal, Stats) {
        // if (currentPrincipal.FireDepartment) return Stats.get({}).$promise;
        //},
        yesterdayStatSummary(currentPrincipal, Stats) {
          if(currentPrincipal.FireDepartment) return Stats.get({ previous: true }).$promise;
        },
        interestingIncidents(currentPrincipal, Incident) {
          if(currentPrincipal.FireDepartment) return Incident.get({ id: 'top', previous: true }).$promise;
        },
        activeIncidents(currentPrincipal, Incident) {
          if(currentPrincipal.FireDepartment) return Incident.active({ id: 'active' }).$promise;
        },
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
        },
        reportNames(ExtensionConfiguration) {
          return ExtensionConfiguration.query({ name: 'Email Report' }).$promise
            .then(extensionConfigs => {
              return extensionConfigs.map(config => config.config_json.name);
            });
        },
      },
    });
}
