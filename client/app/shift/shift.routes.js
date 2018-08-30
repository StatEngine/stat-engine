'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.shift', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.shift.home', {
      url: '/shift',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./shift-home/shift-home.html'),
          controller: 'ShiftHomeController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        deps($ocLazyLoad) {
          return Promise.all([
            import(/* webpackChunkName: "angularCalendar" */ 'angular-bootstrap-calendar').then(mod => $ocLazyLoad.inject('mwl.calendar')),
            import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid').then(mod => $ocLazyLoad.inject('ui.grid'))
          ])
        },
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        stats(Stats) {
          return Stats.getShift().$promise;
        },
      },
    });
}
