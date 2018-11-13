'use strict';

export default class DepartmentAdminEmailController {
  /*@ngInject*/
  constructor(currentPrincipal, reportConfigurations, User, Email) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentPrincipal.FireDepartment;
    this.reportConfigurations = reportConfigurations;

    this.EmailService = Email;

    // defaults
    this.test = true;
    this.startDate = new Date();
    this.startDate.setDate(this.startDate.getDate());
    this.previous = true;
    this.configurationId = this.reportConfigurations.length > 0 ? this.reportConfigurations[0]._id : undefined;
  }

  send() {
    if(this.configurationId) {
      this.EmailService.send({
        id: 'timeRangeAnalysis',
        test: this.test,
        previous: this.previous,
        startDate: this.startDate,
        configurationId: this.configurationId,
      }, {})
        .$promise
        .then(() => {
          console.info('Alert sent');
        });
    }
  }
}
