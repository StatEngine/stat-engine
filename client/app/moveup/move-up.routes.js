'use strict';

let _;

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.moveup', {
      abstract: true,
    })
    .state('site.moveup.home', {
      url: '/move-up-model',
      views: {
        'content@': {
          template: require('./moveup-home/moveup-home.html'),
          controller: 'MoveupHomeController',
          controllerAs: 'vm'
        }
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity();
        },
        units(Unit) {
          return Unit.query().$promise;
        },
        boundary(Principal, FireDepartment) {
          return Principal
            .identity(true)
            .then(currentPrincipal => FireDepartment.getJurisdictionalBoundary({ id: currentPrincipal.fire_department__id }).$promise);
        },
        stations(Principal, FireDepartment) {
          return Principal
            .identity(true)
            .then(currentPrincipal => FireDepartment.getStations({ id: currentPrincipal.fire_department__id }).$promise);
        },
        incidents(Incident) {
          return Incident
            .get({
              count: 1000,
              from: 0,
              source: ['address.geohash']
            })
            .$promise
            .then(data => data.items.map(item => item._source));
        }
      },
    });
}