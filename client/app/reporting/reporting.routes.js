'use strict';

import { Store } from '../../state/store';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.reporting', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<sidebar></sidebar>'
        },
      },
    })
    .state('site.reporting.unit', {
      url: '/reporting/units',
      views: {
        'content@': {
          template: require('./reporting-unit/reporting-unit.html'),
          controller: 'ReportingUnitController',
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
        },
        redirectMe($state, units) {
          return $state.go('site.reporting.unit.detail', { id: Store.unitStore.allUnits[0].id})
        }
      },
    })
    .state('site.reporting.unit.detail', {
      url: '/:id',
      views: {
        'content@': {
          template: require('./reporting-unit/reporting-unit-detail.html'),
          controller: 'ReportingUnitDetailController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        deps($ocLazyLoad) {
          return import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid')
            .then(() => {
              $ocLazyLoad.inject('ui.grid');
            });
        },
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        select($stateParams) {
          return Store.unitStore.select($stateParams.id);
        },
        fetchResponses($stateParams) {
          return Store.unitStore.fetchSelectedResponses($stateParams.id, {
            timeStart: 'todo'
          });
        },
        fetchMetrics($stateParams) {
          return Store.unitStore.fetchSelectedMetrics($stateParams.id, {
            timeStart: 'todo'
          });
        }
      },
    });
}
