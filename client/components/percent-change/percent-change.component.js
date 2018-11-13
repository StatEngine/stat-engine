'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';

export class PercentChangeComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    if(_.isNil(this.oldValue)) this.percent = 'NA';
    this.percent =  Math.round((this.newValue - this.oldValue) / this.oldValue * 100);
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
