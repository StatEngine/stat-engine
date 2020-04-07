/* eslint  class-methods-use-this: 0 */

'use strict';

export default class NotificationController {
  constructor($uibModalInstance, Notification, incidentData, currentPrincipal) {
    this.$uibModalInstance = $uibModalInstance;
    this.notificationService = Notification;
    this.incidentData = incidentData;
    this.currentPrincipal = currentPrincipal;
    this.errors = null;
    this.notifyAll = true;

    this.selectOptions = {
      showCheckAll: false,
      showUncheckAll: false,
      checkBoxes: true,
      template: '{{option}}',
      smartButtonTextConverter(skip, option) { return option; }
    };

    this.units = incidentData.incident.description.units;

    this.personnel = incidentData
      .incident
      .apparatus
      .map(apparatus => apparatus.personnel)
      .flat()
      .filter(personnel => personnel)
      .map(personnel => personnel.employee_id);

    this.payload = {
      firecaresId: currentPrincipal.FireDepartment.firecares_id,
      incident_number: incidentData.incident.description.incident_number,
      requestor_name: currentPrincipal.name,
      test: process.env.NOTIFICATION_TEST_MODE,
      message: null,
      units: [],
      personnel: []
    };

    this.messagePlaceholder = `Incident #${this.payload.incident_number} has been identified as a potential exposure by your department. Please be sure to log any exposures`;
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm() {
    this.notificationService.notify({}, this.payload, response => {
      this.$uibModalInstance.close(response);
    }, error => {
      this.error = error.data;
    });
  }
}
