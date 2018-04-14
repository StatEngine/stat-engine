'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.departmentAdmin', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.departmentAdmin.home', {
      url: '/departmentAdmin',
      template: require('./department-admin-home/department-admin-home.html'),
      controller: 'DepartmentAdminHomeController',
      data: {
        roles: ['department_admin']
      },
      resolve: {
        currentPrincipal(Principal) {
          return Principal.identity(true);
        },
        dataQuality(FireDepartment, currentPrincipal) {
          return FireDepartment.dataQuality({ id: currentPrincipal.FireDepartment.firecares_id, type: 'fire-incident'});
        },
        departmentUsers(User, currentPrincipal) {
          return User.query();
        },
      },
      controllerAs: 'vm'
    });
}
