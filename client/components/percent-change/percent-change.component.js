'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class PercentChangeComponent {
  newValue;
  oldValue;

  $onChanges() {
    if(this.oldValue == null || this.newValue == null) {
      this.percent = 'NA';
    } else {
      this.percent = Math.round((this.newValue - this.oldValue) / this.oldValue * 100);
    }
  }
}

export default angular.module('directives.percentChange', [])
  .component('percentChange', {
    template: require('./percent-change.html'),
    controller: PercentChangeComponent,
    controllerAs: 'vm',
    bindings: {
      newValue: '<',
      oldValue: '<',
    },
  })
  .name;
