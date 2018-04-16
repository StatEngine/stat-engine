'use strict';

export default class DepartmentAdminHomeController {
  /*@ngInject*/
  constructor(currentPrincipal, dataQuality, departmentUsers, User) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.dataQuality = dataQuality;
    this.users = departmentUsers;
    this.UserService = User;
  }

  refreshUsers() {
    this.UserService.query().$promise
      .then(users => {
        this.users = users;
      });
  }

  approveAccess(user) {
    this.UserService.approveAccess({ id: user._id}, {}).$promise
      .finally(() => {
        this.refreshUsers();
      });
  }

  revokeAccess(user) {
    this.UserService.revokeAccess({ id: user._id}, {}).$promise
      .finally(() => {
        this.refreshUsers();
      });
  }
}
