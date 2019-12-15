'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.departmentAdmin', {
      abstract: true,
      views: {
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
      },
    })
    .state('site.departmentAdmin.email', {
      url: '/departmentAdmin/email',
      views: {
        'content@': {
          template: require('./department-admin-email/department-admin-email.html'),
          controller: 'DepartmentAdminEmailController',
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
        reportConfigurations(ExtensionConfiguration) {
          return ExtensionConfiguration.query({ name: 'Email Report' }).$promise;
        },
      },
    })
    .state('site.departmentAdmin.createNewUser', {
      url: '/departmentAdmin/create-new-user',
      views: {
        'content@': {
          template: require('./department-admin-create-new-user/department-admin-create-new-user.html'),
          controller: 'DepartmentAdminCreateNewUserController',
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
      },
    });
}
