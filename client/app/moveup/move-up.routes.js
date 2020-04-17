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
        },
      }
    });
}