'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

import { autorun } from "mobx"

export class ReportingItemListComponent {
  constructor($timeout) {
    'ngInject';

    this.$timeout = $timeout;
  }

  $onInit() {
    autorun(() => {
      console.dir(this.store)
      this.selected = this.store.selected;

      console.dir('this selected = ' + this.selected);

      this.$timeout(() => {});
    })
  }

  $onDestroy() {
    console.dir('destory the autorunner')
  }

  select(id) {
    this.store.select(id);
    this.store.fetchStats(id);
  }
}

export default angular.module('reportingItemLIst', [])
  .component('reportingItemList', {
    template: require('./reporting-item-list.html'),
    controller: ReportingItemListComponent,
    controllerAs: 'vm',
    bindings: {
      items: '<',
      store: '<',
    },
  })
  .name;
