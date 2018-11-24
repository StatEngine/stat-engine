'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';

export class BarGaugeComponent {
  constructor($element) {
    'ngInject';
    this.element = $element[0];
    this.needle = $(this.element.querySelector('.bar-gauge-needle'));
    this.gauge = $(this.element.querySelector('.bar-gauge'));
    this.wrapper = $(this.element.querySelector('.bar-gauge-wrapper'));
  }

  $onInit() {
    this.metricTitle = this.metricTitle || 'Count';
    this.total = _.sumBy(this.data, n => n.count);
    console.log(this.needle)

    this.gauge.css({width: (this.average / this.max) * (this.wrapper.width()) + 'px'});
    this.needle.css({left: (this.value / this.max) * (this.wrapper.width() - 5) + 'px'});
  }
}

export default angular.module('directives.barGauge', [])
  .component('barGauge', {
    template: require('./bar-gauge.html'),
    controller: BarGaugeComponent,
    controllerAs: 'vm',
    bindings: {
      value: '@',
      min: '@',
      max: '@',
      average: '@',
      maxLabel: '@',
      minLabel: '@'
    },
  })
  .name;
