'use strict';

import _ from 'lodash';
import moment from 'moment';

export default class DepartmentAdminEmailController {
  /*@ngInject*/
  constructor(currentPrincipal, departmentUsers, User, Email) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.users = _.filter(departmentUsers, u => !u.isAdmin);
    this.UserService = User;
    this.EmailService = Email;

    const ShiftConfiguration = FirecaresLookup[currentPrincipal.FireDepartment.firecares_id];

    if (ShiftConfiguration) {
      this.shiftly = new ShiftConfiguration();

      this.yesterday = moment().tz(this.fireDepartment.timezone).subtract(1, 'days');
      this.yesterdaysShift = this.shiftly.shiftTimeFrame(this.yesterday.format());
    }
  }

  _calculateShift(date) {
    return this.shiftly.calculateShift(date.format()).toUpperCase();
  }

  test() {
    console.info('Sending email');
    this.EmailService.send({ id: 'timeRangeAnalysis', test: true, timeRange: this.yesterdaysShift })
      .$promise
      .then(() => {
        alert('Sent Email!')
      })
  }
}
