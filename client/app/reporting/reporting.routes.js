'use strict';

import { Store } from '../../state/store';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.reporting', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.reporting.home', {
      url: '/reporting',
      views: {
        'content@': {
          template: require('./reporting-home/reporting-home.html'),
          controller: 'ReportingHomeController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        units() {
          return Store.unitStore.fetchUnits();
        }
      },
    });
}
