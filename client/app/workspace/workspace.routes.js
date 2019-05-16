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
        workspaces(User) {
          return User.get().$promise.then(user => user.workspaces);
        },
      }
    })
    .state('site.workspace.manage', {
      url: '/workspaces/manage',
      views: {
        'content@': {
          template: require('./workspace-manage/workspace-manage.html'),
          controller: 'WorkspaceManageController',
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
        currentWorkspace(Workspace, $stateParams) {
          if($stateParams.id === 'new') return;
           return Workspace.get({ id: $stateParams.id }).$promise;
        },
      },
    })
    .state('site.workspace.edit.users', {
      url: '/users',
      views: {
        'content@': {
          template: require('./workspace-users/workspace-users.html'),
          controller: 'WorkspaceUsersController',
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
