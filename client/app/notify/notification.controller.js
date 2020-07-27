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
    this.error = null;
    this.additionalPersonnel = null;
    this.selected = null;
    this.units = [];
    const incident_number = incidentData.incident.description.incident_number;
    this.messagePlaceholder = `Incident #${incident_number} has been identified as a potential exposure by your department. Please be sure to log any exposures`;

    this.autoCompleteOptions = {
      minimumChars: 4,
      customClasses: "pl-2 addition-personnel",
      placeholder: "Personel ID",
      data: (searchText) => {
        return fetch(`/api/personnel/?query=${searchText}`)
          .then(response => response.json())
          .then(data => data);
      },
      onSelect: selected => {
        const custom = this.units.find(unit => unit.type === 'custom');
        const personnel = custom && custom.children.find(personnel => personnel.id === selected);
        if (!personnel) {
          this.addPersonnel(selected);
        } else {
          this.additionalPersonnel = null;
        }
      }
    };

    // Check if apparatuses exist
    if (incidentData && incidentData.incident && incidentData.incident.apparatus) {
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
        .sort((a, b) => {
          if (a.children.length < b.children.length) {
            return 1;
          }

          if (a.children.length > b.children.length) {
            return -1;
          }

          return 0;
        })
        .filter(unit => unit.children.length > 0)
    }

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

  addPersonnel(personnel) {
    const units = this.units.filter(unit => unit.type !== 'custom');
    const custom = this.units.find(unit => unit.type === 'custom');
    const customChildren = custom && custom.children || [];

    if (!personnel) {
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
            id: personnel,
            label: personnel,
            type: 'personnel'
          }
        ]
      }
    ];

    this.additionalPersonnel = null;
  }

  submitForm() {
    this.error = null;
    const personnel = Object.values(this.selected)
      .map(unit => 
        Object.keys(unit).filter(key => unit[key])
      ).flat();
    const payload = {
      ...this.payload,
      personnel
    };

    this.notificationService.notify({}, payload, response => {
      const incident_number = this.incidentData.incident.description.incident_number;
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
        app: 'Notification',
        action: 'sent',
        incident_number
      });
      this.$uibModalInstance.close(response);
    }, error => {
      this.error = `An error occurred sending notification.`;
    });
  }
}
