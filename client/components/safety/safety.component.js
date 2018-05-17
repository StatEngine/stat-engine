'use strict';

import angular from 'angular';

export class SafetyController {
  constructor() {
    'ngInject';
  }
}


export default angular.module('safety', [])
  .component('safety', {
    template: require('./safety.component.html'),
    controller: SafetyController,
    controllerAs: 'vm',
    bindings: {
      message: '<'
    },
  })
  .name;
