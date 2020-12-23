'use strict';

import angular from 'angular';

export class ValidationCheckComponent {

}

export default angular.module('validationCheck', [])
  .component('validationCheck', {
    template: require('./validation-check.html'),
    controller: ValidationCheckComponent,
    controllerAs: 'vm',
    bindings: {
      incidents: '<',
    },
  })
  .name;
