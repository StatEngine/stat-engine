'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.nfpa', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.nfpa.home', {
      url: '/nfpa',
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: require('./nfpa-home/nfpa-home.html'),
          controller: 'NFPAHomeController',
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
        nfpaResults(FireDepartment, currentPrincipal) {
          return FireDepartment.nfpa({ id: currentPrincipal.FireDepartment._id, resource: 'fire-incident' }).$promise;
        },
      },
    });
}
