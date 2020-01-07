'use strict';

import angular from 'angular';
import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment-timezone';

export class ShiftTextController {
  constructor() {
    'ngInject';
  }

  $onInit() {
    const ShiftConfiguration = FirecaresLookup[this.firecaresId];

    if(!this.daysAgo) this.daysAgo = 0;
    if(ShiftConfiguration) {

      this.shiftly = new ShiftConfiguration();
      this.today = moment()
        .tz(this.timezone)
        .subtract(this.daysAgo, 'days');
      this.todaysShift = {
        date: this.today.format('ddd, MM-DD'),
        shift: this.shiftly.calculateShift(this.today.format()),
      };
    }
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
