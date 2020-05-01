'use strict';

import angular from 'angular';

export class TreeSelectComponent {
  $onInit() {
    this.selected = {};
  }
  
  onCheckParent(parent) {
    const checked = parent.children.map(child => ({[child.id]: true}))
    this.selected = {
      ...this.selected,
      [parent.id]: Object.assign({}, ...checked)
    };

  }

  shouldBeChecked(parent) {
    const selected = this.selected[parent.id];
    if (!selected) {
      return false;
    }

    return parent.children.length === Object.values(selected).filter(checked => checked).length
  }
}

export default angular.module('treeSelect', [])
  .component('treeSelect', {
    template: require('./tree-select.html'),
    controller: TreeSelectComponent,
    controllerAs: 'vm',
    bindings: {
      selected: '=',
      options: '='
    },
  })
  .name;
