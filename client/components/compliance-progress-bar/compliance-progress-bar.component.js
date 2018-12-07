'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

function round5(x) {
  return Math.ceil(x / 5) * 5;
}

export class ComplianceProgressBarComponent {
  constructor($interval) {
    'ngInject';

    this.$interval = $interval
  }

  $onInit() {
    const correctedValues = this.values;
    for(let i = 0; i < correctedValues.length; i++) {
      if(correctedValues[i] > this.max) correctedValues[i] = this.max;
    }
    this.valuesStr = correctedValues.join(',');

    const options = this.options || {};
    options.width = '150px';
    options.height = '20px';
    options.type = 'bullet';

    $(`.inlinesparkline`).sparkline('html', options);

    // HACK = find out why we need to refresh
    this.interval = this.$interval(() => { $.sparkline_display_visible(); }, 1000);
  }

  $onDestroy() {
    if(this.interval) this.$interval.cancel(this.interval);
  }
}

export default angular.module('directives.complianceProgressBar', [])
  .component('complianceProgressBar', {
    template: require('./compliance-progress-bar.html'),
    controller: ComplianceProgressBarComponent,
    controllerAs: 'vm',
    bindings: {
      options: '<',
      values: '<',
      text: '@',
      id: '@',
      max: '<'
    },
  })
  .name;
