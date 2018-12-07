'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class BulletChartComponent {
  constructor($interval) {
    'ngInject';

    this.$interval = $interval;
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

    $('.inlinesparkline').sparkline('html', options);

    // eslint-disable-next-line no-warning-comments
    // TODO - find more efficient way to refresh
    this.interval = this.$interval(() => { $.sparkline_display_visible(); }, 1000);
  }

  $onDestroy() {
    if(this.interval) this.$interval.cancel(this.interval);
  }
}

export default angular.module('directives.bulletChart', [])
  .component('bulletChart', {
    template: require('./bullet-chart.html'),
    controller: BulletChartComponent,
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
