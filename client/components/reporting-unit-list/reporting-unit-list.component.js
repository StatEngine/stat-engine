'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

import { autorun } from "mobx"

export class ReportingUnitListComponent {
  constructor($timeout) {
    'ngInject';

    this.$timeout = $timeout;
  }

  $onInit() {
    autorun(() => {
      this.selected = this.store.selected;
      this.$timeout(() => {});
    })
  }

  $onDestroy() {
    console.dir('destroy the autorunner!')
  }

  select(id) {
    this.store.select(id);
    this.store.fetchStats(id);
  }
}

export default angular.module('reportingUnitList', [])
  .component('reportingUnitList', {
    template: require('./reporting-unit-list.html'),
    controller: ReportingUnitListComponent,
    controllerAs: 'vm',
    bindings: {
      units: '<',
      store: '<',
    },
  })
  .name;
