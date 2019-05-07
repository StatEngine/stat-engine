/* eslint-disable no-unused-vars */

'use strict';

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
        units(Unit) {
          return Unit.query().$promise;
        },
        redirect(units, $window, $state, $stateParams) {
          let selectedUnitId = $stateParams['#'];
          if(selectedUnitId != null) {
            return
          }

          const isLargeScreen = ($window.innerWidth >= 992);
          if(isLargeScreen) {
            selectedUnitId = units[0].id;
            $state.go('site.reporting.unit', { '#': selectedUnitId, time: $stateParams.time });
          }
        }
      },
    });
}
