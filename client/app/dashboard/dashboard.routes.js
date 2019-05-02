'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.dashboard', {
      abstract: true,
    })
    .state('site.dashboard.home', {
      url: '/dashboards',
      views: {
        'content@': {
          template: require('./dashboard-tenancy/dashboard-tenancy.html'),
          controller: 'DashboardTenancyController',
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
        router($window, currentPrincipal) {
          // As of now, only global users have multiple tenancies
          // So if not global, just send straight to kibana
          if (!currentPrincipal.isGlobal) $window.location.href = '/dashboard';
        }
      }
    })
}
