'use strict';

import angular from 'angular';
import { FirecaresLookup } from '@statengine/shiftly';

export class ShiftTextController {
  constructor() {
    'ngInject';
  }

  $onInit() {
    const ShiftConfiguration = FirecaresLookup[this.firecaresId];

    if (!this.daysAgo) this.daysAgo = 0;
    if(ShiftConfiguration) {
      this.shiftly = new ShiftConfiguration();

      this.today = moment().tz(this.timezone).subtract(this.daysAgo, 'days');
      this.today.set('hour', this.shiftly.shiftStart.substring(0, 2));
      this.today.set('minutes', this.shiftly.shiftStart.substring(2, 4));
      this.todaysShift = {
        date: this.today.format('ddd, MM-DD'),
        shift: this._calculateShift(this.today),
      };
    }
  }

  _calculateShift(date) {
    return this.shiftly.calculateShift(date.format()).toUpperCase();
  }
}


export default angular.module('directives.shift', [])
  .component('shiftText', {
    template: require('./shift.component.html'),
    controller: ShiftTextController,
    controllerAs: 'vm',
    bindings: {
      firecaresId: '@',
      timezone: '@',
      daysAgo: '<'
    },
  })
  .name;
