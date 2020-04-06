'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class ReportingUnitListComponent {
  units;
  onSelect;
  selectedUnitId;
  sort = 'id';

  select(unit) {
    this.onSelect({ selected: unit });
  }
}

export default angular.module('reportingUnitList', [])
  .component('reportingUnitList', {
    template: require('./reporting-unit-list.html'),
    controller: ReportingUnitListComponent,
    controllerAs: 'vm',
    bindings: {
      units: '<',
      onSelect: '&',
      selectedUnitId: '<',
    },
  })
  .name;
