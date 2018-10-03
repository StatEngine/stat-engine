'use strict';

let _;

export default class AdminHomeController {
  /*@ngInject*/
  constructor(User, FireDepartment, Modal, fireDepartments, users) {
    this.UserService = User;
    this.FireDepartmentService = FireDepartment;
    this.ModalService = Modal;
    this.fireDepartments = fireDepartments;
    this.users = users;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.onboardedFireDepartments = _.filter(this.fireDepartments, fd => fd.integration_verified);
    this.integratedFireDepartments = _.filter(this.fireDepartments, fd => fd.integration_complete && !fd.integration_verified);
    this.notStartedFireDepartments = _.filter(this.fireDepartments, fd => !fd.integration_complete);

    this.buildData();
  }

  buildData() {
    this.fireDepartmentLookup = _.keyBy(this.fireDepartments, '_id');
    this.adminUsers = _.filter(this.users, u => u.isAdmin);
    this.globalUsers = _.filter(this.users, u => u.isGlobal);
    this.ingestUsers = _.filter(this.users, u => u.isIngest);
    this.homelessUsers = _.filter(this.users, u => !u.requested_fire_department_id && !u.FireDepartment && !u.isAdmin);
    this.pendingUsers = _.filter(this.users, u => u.requested_fire_department_id);
    this.departmentUsers = _.groupBy(this.users, 'FireDepartment._id');
  }

  refreshUsers() {
    this.UserService.query().$promise
      .then(users => {
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

  fixtures(type) {
    let params = {
      resource2: type
    };


    this.FireDepartmentService.fixtures(params, {}).$promise
      .then(() => {
        this.ModalService.ok()('Success', 'Fixtures Loaded!');
      })
      .catch(err => {
        console.error(err);
        this.ModalService.ok()('Error', 'Fixtures Error', err);
      });
  }
}
