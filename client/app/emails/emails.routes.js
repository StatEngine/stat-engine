'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.emails', {
      abstract: true,
    })
    .state('site.emails.home', {
      url: '/emails',
      views: {
        'content@': {
          template: require('./emails-select/emails-select.html'),
          controller: 'EmailsSelectController',
          controllerAs: 'vm',
        },
      },
      data: {
        roles: ['dashboard_user', 'department_admin'],
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      },
    });
  // .state('site.emails.edit', {
  //   url: '/emails/:id',
  //   views: {
  //     'content@': {
  //       template: require('./emails-edit/emails-edit.html'),
  //       controller: 'EmailsEditController',
  //       controllerAs: 'vm'
  //     }
  //   },
  //   data: {
  //     roles: ['dashboard_user','department_admin']
  //   },
  //   resolve: {
  //     currentPrincipal(Principal) {
  //       return Principal.identity(true);
  //     },
  //   },
  // })
}
