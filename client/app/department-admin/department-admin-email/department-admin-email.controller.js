'use strict';

import 'babel-polyfill';

let _;

export default class DepartmentAdminEmailController {
  /*@ngInject*/
  constructor(currentPrincipal, departmentUsers, User, Email) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.departmentUsers = departmentUsers;
    this.UserService = User;
    this.EmailService = Email;

    // defaults
    this.timeUnit = 'DAY';
    this.test = true;
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate() - 1);
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.users = _.filter(this.departmentUsers, u => !u.isAdmin);
  }

  send() {
    this.EmailService.send({
      id: 'timeRangeAnalysis',
      test: this.test,
      startDate: this.startDate,
      timeUnit: this.timeUnit,
    }, {})
      .$promise
      .then(() => {
        console.info('Alert sent');
      });
  }
}
