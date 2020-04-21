/* eslint  class-methods-use-this: 0 */

'use strict';

export default class NotificationController {
  constructor($uibModalInstance, Notification, incidentData, currentPrincipal, AmplitudeService, AnalyticEventNames) {
    this.$uibModalInstance = $uibModalInstance;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.notificationService = Notification;
    this.incidentData = incidentData;
    this.currentPrincipal = currentPrincipal;
    this.errors = null;
    this.notifyAll = true;

    this.selectOptions = {
      showCheckAll: false,
      showUncheckAll: false,
      checkBoxes: true,
      smartButtonTextConverter(skip, option) { return option; }
    };

    this.selectOptionPersonel = {
      ...this.selectOptions,
      template: '{{option}}',
    };

    this.units = incidentData.incident.apparatus.map(unit => {
      const personnel = unit.personnel.map(personal => personal.employee_id).join(', ');
      return {
        id: unit.unit_id,
        label: `${unit.unit_id} (${personnel})`
      };
    });

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
      test: false,
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
      const incident_number = incidentData.incident.description.incident_number;
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'Notification',
        action: 'sent',
        incident_number
      });
      this.$uibModalInstance.close(response);
    }, error => {
      this.error = error.data;
    });
  }
}
