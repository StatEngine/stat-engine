'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.incident', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<sidebar></sidebar>'
        },
      },
    })
    .state('site.incident.search', {
      url: '/incidents/search',
      views: {
        'content@': {
          template: require('./incident-search/incident-search.html'),
          controller: 'IncidentSearchController',
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
              $ocLazyLoad.inject('ui.grid.resizeColumns');
            });
        },
      },
    })
    .state('site.incident.analysis', {
      url: '/incidents/:id',
      views: {
        'content@': {
          template: require('./incident-analysis/incident-analysis.html'),
          controller: 'IncidentAnalysisController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        deps($ocLazyLoad) {
          return Promise.all([
            import(/* webpackChunkName: "bootstrap-js" */ 'bootstrap/dist/js/bootstrap'),
            import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid').then(() => $ocLazyLoad.inject('ui.grid')),
          ]);
        },
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        incidentData(Incident, $stateParams) {
          return Incident.get({ id: $stateParams.id }).$promise;
        },
      },
    });
}
