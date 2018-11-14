/* eslint-disable no-unused-vars */

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
        buildFilters(currentPrincipal) {
          return Store.uiStore.buildFilters(currentPrincipal.FireDepartment);
        },
        redirectMe($state, units) {
          return $state.go('site.reporting.unit.detail', { id: Store.unitStore.allUnits[0].id, time: 'shift' });
        }
      },
    })
    .state('site.reporting.unit.detail', {
      url: '/:id?time',
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
              $ocLazyLoad.inject('ui.grid.pagination');
            });
        },
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        selectUnit($stateParams) {
          return Store.unitStore.select($stateParams.id);
        },
        selectTime($stateParams) {
          return Store.uiStore.setTimeFilter($stateParams.time);
        },
        fetchResponses(selectTime, selectUnit, $stateParams) {
          return Store.unitStore.fetchSelectedResponses($stateParams.id, {
            timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
            timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
          });
        },
        fetchMetrics(selectTime, selectUnit, $stateParams) {
          return Store.unitStore.fetchSelectedMetrics($stateParams.id, {
            timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
            timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
            subInterval: Store.uiStore.selectedFilters.timeFilter.filter.subInterval
          });
        },
        fetchPreviousMetrics(selectTime, selectUnit, $stateParams) {
          return Store.unitStore.fetchSelectedPreviousMetrics($stateParams.id, {
            timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
            timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
            subInterval: Store.uiStore.selectedFilters.timeFilter.filter.subInterval
          });
        },
        fetchTotalMetrics(selectTime, selectUnit, $stateParams) {
          return Store.unitStore.fetchSelectedTotalMetrics($stateParams.id, {
            timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
            timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
            interval: Store.uiStore.selectedFilters.timeFilter.filter.interval
          });
        },
      },
    });
}
