'use strict';

import angular from 'angular';

export class TreeSelectComponent {

  $onInit() {
    console.log(this.options);
  }
  
}

export default angular.module('treeSelect', [])
  .component('treeSelect', {
    template: require('./tree-select.html'),
    controller: TreeSelectComponent,
    controllerAs: 'vm',
    bindings: {
      selected: '=',
      options: '<'
    },
  })
  .name;
