'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.admin', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.admin.home', {
      url: '/admin',
      template: require('./admin-home/admin-home.html'),
      controller: 'AdminHomeController',
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
      controllerAs: 'vm'
    })
    .state('site.admin.fireDepartment', {
      url: '/admin/fireDepartment/:id',
      template: require('./fire-department/fire-department.html'),
      controller: 'FireDepartmentController',
      data: {
        roles: ['admin']
      },
      resolve: {
        currentFireDepartment(FireDepartment, $stateParams) {
          if ($stateParams.id === 'new') return;
          return FireDepartment.get({ id: $stateParams.id }).$promise;
        },
      },
      controllerAs: 'vm'
    })
    .state('site.admin.user', {
      url: '/admin/user/:id',
      template: require('./user/user.html'),
      controller: 'UserController',
      data: {
        roles: ['admin']
      },
      resolve: {
        currentUser(User, $stateParams) {
          if ($stateParams.id === 'new') return;
          return User.get({ id: $stateParams.id }).$promise;
        },
        fireDepartments(FireDepartment) {
          return FireDepartment.query().$promise;
        }
      },
      controllerAs: 'vm'
    });
}
