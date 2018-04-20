'use strict';

import _ from 'lodash';

export default class DepartmentAdminHomeController {
  /*@ngInject*/
  constructor(currentPrincipal, dataQuality, departmentUsers, User) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.dataQuality = dataQuality;
    this.users = _.filter(departmentUsers, u => !u.isAdmin);
    this.UserService = User;
  }

  refreshUsers() {
    this.UserService.query().$promise
      .then(departmentUsers => {
        this.users = _.filter(departmentUsers, u => !u.isAdmin);
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
