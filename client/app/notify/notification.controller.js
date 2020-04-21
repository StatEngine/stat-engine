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
    this.selected = [];
    const incident_number = incidentData.incident.description.incident_number;
    this.messagePlaceholder = `Incident #${incident_number} has been identified as a potential exposure by your department. Please be sure to log any exposures`;

    this.personnel = incidentData
      .incident
      .apparatus
      .map(unit => {
        return unit.personnel.map(person => ({
          id: person.employee_id,
          label: person.employee_id,
          unit: unit.unit_id
        }))
      })
      .flat();
    const units = [...new Set(this.personnel.map(personnel => personnel.unit))];

    this.selectOptions = {
      checkBoxes: true,
      groupByTextProvider: group => `Unit ${group}`,
      groupBy: 'unit',
      template: '{{option.id}}',
      selectByGroups: units,
    };

    this.payload = {
      firecaresId: currentPrincipal.FireDepartment.firecares_id,
      incident_number,
      requestor_name: currentPrincipal.name,
      test: false,
      message: null,
      units: [],
      personnel: []
    };
  }

  cancel() {
    this.$uibModalInstance.dismiss('cancel');
  }

  submitForm() {
    const payload = {
      ...this.payload,
      units: this.payload.units.map(unit => unit.id)
    };

    this.notificationService.notify({}, payload, response => {
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
