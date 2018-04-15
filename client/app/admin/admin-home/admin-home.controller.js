'use strict';

import _ from 'lodash';

export default class AdminHomeController {
  /*@ngInject*/
  constructor(User, fireDepartments, users) {
    this.UserService = User;
    this.fireDepartments = fireDepartments;
    this.users = users;

    this.buildData();
  }

  buildData() {
    this.fireDepartmentLookup = _.keyBy(this.fireDepartments, '_id');
    this.adminUsers = _.filter(this.users, u => u.isAdmin);
    this.ingestUsers = _.filter(this.users, u => u.isIngest);
    this.homelessUsers = _.filter(this.users, u => !u.requested_fire_department_id && !u.FireDepartment && !u.isAdmin);
    this.pendingUsers = _.filter(this.users, u => u.requested_fire_department_id);
    this.departmentUsers = _.groupBy(this.users, 'FireDepartment._id');
  }

  refreshUsers() {
    this.UserService.query().$promise
      .then((users) => {
        this.users = users;
        this.buildData();
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
