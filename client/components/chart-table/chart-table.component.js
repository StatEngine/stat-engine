'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';

export class ChartTableComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.metricTitle = this.metricTitle || 'Count';
  }

  $onChanges(changes) {
    if(changes.data) {
      this.total = _.sumBy(this.data, n => n.count);
    }
  }
}

export default angular.module('directives.chartTable', [])
  .component('chartTable', {
    template: require('./chart-table.html'),
    controller: ChartTableComponent,
    controllerAs: 'vm',
    bindings: {
      newValue: '<',
      oldValue: '<',
      data: '<',
      metricTitle: '@',
      title: '@',
    },
  })
  .name;
