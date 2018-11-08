'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import numeral from 'numeral';

export class RankComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    this.numeral = numeral(this.newValue).format('0o');
  }
}

export default angular.module('directives.rank', [])
  .component('rank', {
    template: require('./rank.html'),
    controller: RankComponent,
    controllerAs: 'vm',
    bindings: {
      newValue: '<',
      oldValue: '<',
    },
  })
  .name;
