'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';

function round5(x)
{
  return Math.ceil(x/5)*5;
}

export class ComplianceProgressBarComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.percent = Math.round((this.value / this.max)*100);

    if (this.value <= this.success) this.thresholdClass = 'bg-success';
    else if (this.value > this.success && this.value <= this.warning) this.thresholdClass = 'bg-warning';
    else if (this.value > this.warning) this.thresholdClass = 'bg-danger';
  }

  getClass() {
    const c = `${this.thresholdClass} wd-${round5(this.percent)}p`;

    return c;
  }
}

export default angular.module('directives.complianceProgressBar', [])
  .component('complianceProgressBar', {
    template: require('./compliance-progress-bar.html'),
    controller: ComplianceProgressBarComponent,
    controllerAs: 'vm',
    bindings: {
      success: '<',
      warning: '<',
      danger: '<',
      value: '<',
      max: '<',
      text: '@'
    },
  })
  .name;
