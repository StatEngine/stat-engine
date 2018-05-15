'use strict';

export class IncidentSummaryController {
    constructor() {
      'ngInject';
      console.dir(this)
    }
}


export default angular.module('tables.incidentSummary', [])
  .component('incidentSummaryTable', {
    template: require('./incident-summary.component.html'),
    controller: IncidentSummaryController,
    controllerAs: 'vm',
    bindings: {
      data: '<'
    },
  })
  .name;
