'use strict';

import angular from 'angular';

export class StatsTableController {
  constructor() {
    'ngInject';
  }
}

export default angular.module('tables.statsTable', [])
  .component('statsTable', {
    template: require('./stats-table.component.html'),
    controller: StatsTableController,
    controllerAs: 'vm',
    bindings: {
      options: '<'
    },
  })
  .name;
