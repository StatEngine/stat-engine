'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.incident', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.incident.search', {
      url: '/incidents/search',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
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
            .then(mod => {
              $ocLazyLoad.inject('ui.grid');
            });
        },
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        recentIncidents(Incident) {
          return Incident.query().$promise;
        },
      },
    })
    .state('site.incident.analysis', {
      url: '/incidents/:id',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
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
          return import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid')
            .then(mod => {
              $ocLazyLoad.inject('ui.grid');
            });
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
