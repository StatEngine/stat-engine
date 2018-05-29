'use strict';

import moment from 'moment';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.incident', {
      abstract: true,
      template: '<div ui-view />'
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
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        incidentData(Incident, $stateParams) {
          return Incident.get({ id: $stateParams.id }).$promise;
        },
      },
    });
}
