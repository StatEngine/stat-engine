/* eslint-disable no-unused-vars */

'use strict';

import { Store } from '../../state/store';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.reporting', {
      abstract: true,
    })
    .state('site.reporting.unit', {
      url: '/reporting/units?time',
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
      reloadOnSearch: false,
      resolve: {
        deps($ocLazyLoad) {
          return import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid')
            .then(() => {
              $ocLazyLoad.inject('ui.grid');
              $ocLazyLoad.inject('ui.grid.pagination');
              $ocLazyLoad.inject('ui.grid.resizeColumns');
            });
        },
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        units() {
          return Store.unitStore.fetchUnits();
        },
        redirect(units, $window, $state, $stateParams) {
          let selectedUnitId = $stateParams['#'];
          if(selectedUnitId != null) {
            return
          }

          const isLargeScreen = ($window.innerWidth >= 992);
          if(isLargeScreen) {
            selectedUnitId = Store.unitStore.allUnits[0].id;
            $state.go('site.reporting.unit', { '#': selectedUnitId, time: $stateParams.time });
          }
        }
      },
    });
}
