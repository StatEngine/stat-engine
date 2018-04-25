'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.departmentAdmin', {
      abstract: true,
      views: {
        'navbar@': {
          template: '<navbar class="animated fadeInDown dark-bg"></navbar>'
        },
        'content@': {
          template: '<div ui-view />'
        }
      },
    })
    .state('site.departmentAdmin.home', {
      url: '/departmentAdmin',
      views: {
        'content@': {
          template: require('./department-admin-home/department-admin-home.html'),
          controller: 'DepartmentAdminHomeController',
          controllerAs: 'vm'
        }
      },
      data: {
        roles: ['department_admin']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        dataQuality(FireDepartment, currentPrincipal) {
          return FireDepartment.dataQuality({ id: currentPrincipal.FireDepartment._id, resource: 'fire-incident' }).$promise;
        },
        departmentUsers(User) {
          return User.query().$promise;
        },
      },
    });
}
