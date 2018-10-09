'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class PercentChangeComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    console.dir(this.oldValue)
    console.dir(this.newValue)

    if(_.isNil(this.oldValue)) this.percent = 'NA';
    this.percent =  Math.round((this.newValue - this.oldValue) / this.oldValue * 100);
    console.dir(this.percent)
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
