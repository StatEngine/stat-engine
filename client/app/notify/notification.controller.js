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
    this.additionalPersonnel = null;
    this.selected = null;
    const incident_number = incidentData.incident.description.incident_number;
    this.messagePlaceholder = `Incident #${incident_number} has been identified as a potential exposure by your department. Please be sure to log any exposures`;

    this.units = incidentData
      .incident
      .apparatus
      .map(unit => ({
        id: unit.unit_id,
        label: `Unit ${unit.unit_id}`,
        type: 'unit',
        children: unit.personnel.map(person => ({
          id: person.employee_id,
          label: person.employee_id,
          type: 'personnel'
        }))
      }))
      .flat()
      .sort((a,b) => {
        if (a.children.length < b.children.length) {
          return 1;
        }

        if (a.children.length > b.children.length) {
          return -1;
        }

        return 0;
      })
      .filter(unit => unit.children.length > 0)

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

  addPersonel(e) {
    e.preventDefault();
    e.stopPropagation();
    const personel = this.additionalPersonnel;
    const units = this.units.filter(unit => unit.type !== 'custom');
    const custom = this.units.find(unit => unit.type === 'custom');
    const customChildren = custom && custom.children || [];

    if (!personel) {
      return;
    }

    this.units = [
      ...units,
      {
        id: 0,
        label: `Additonal`,
        type: 'custom',
        children: [
          ...customChildren,
          {
            id: personel,
            label: personel,
            type: 'personnel'
          }
        ]
      }
    ];

    this.additionalPersonnel = null;
  }

  submitForm() {
    const personel = Object.values(this.selected).map(obj => Object.keys(obj)).flat()
    const payload = {
      ...this.payload,
      personel
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
