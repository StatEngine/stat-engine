'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.workspace', {
      abstract: true,
    })
    .state('site.workspace.home', {
      url: '/workspaces',
      views: {
        'content@': {
          template: require('./workspace-select/workspace-select.html'),
          controller: 'WorkspaceSelectController',
          controllerAs: 'vm',
        }
      },
      data: {
        roles: ['dashboard_user','department_admin']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      }
    })
    .state('site.workspace.edit', {
      url: '/workspaces/:id',
      views: {
        'content@': {
          template: require('./workspace-edit/workspace-edit.html'),
          controller: 'WorkspaceEditController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['dashboard_user','department_admin']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
      },
    })
}
