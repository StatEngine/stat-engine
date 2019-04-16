'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.admin', {
      abstract: true,
      views: {
        'content@': {
          template: '<div ui-view />'
        }
      },
    })
    .state('site.admin.home', {
      url: '/admin',
      views: {
        'content@': {
          template: require('./admin-home/admin-home.html'),
          controller: 'AdminHomeController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['admin']
      },
      resolve: {
        fireDepartments(FireDepartment) {
          return FireDepartment.query().$promise;
        },
        users(User) {
          return User.query().$promise;
        },
      },
    })
    .state('site.admin.fireDepartment', {
      url: '/admin/fireDepartment/:id',
      views: {
        'content@': {
          template: require('./fire-department/fire-department.html'),
          controller: 'FireDepartmentController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['admin']
      },
      resolve: {
        currentFireDepartment(FireDepartment, $stateParams) {
          if($stateParams.id === 'new') return;
          return FireDepartment.get({ id: $stateParams.id }).$promise;
        },
      },
    })
    .state('site.admin.user', {
      url: '/admin/user/:id',
      views: {
        'content@': {
          template: require('./user/user.html'),
          controller: 'UserController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['admin']
      },
      resolve: {
        currentUser(User, $stateParams) {
          if($stateParams.id === 'new') return;
          return User.get({ id: $stateParams.id }).$promise;
        },
        fireDepartments(FireDepartment) {
          return FireDepartment.query().$promise;
        }
      },
    });
}
