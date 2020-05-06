'use strict';

import angular from 'angular';

export class TreeSelectComponent {
  $onInit() {
    this.selected = {};
    this.selectedParents = {};
  }
  
  onCheckParent(parent) {
    const allChildren = parent.children.map(child => child.id);
    const isAllChildrenSelected = this.selected.hasOwnProperty(parent.id) 
      && Object.values(this.selected[parent.id]).filter(checked => checked).length === allChildren.length;

    if (isAllChildrenSelected) {
      const unchecked = parent.children.map(child => ({[child.id]: false}))
      this.selected = {
        ...this.selected,
        [parent.id]: Object.assign({}, ...unchecked)
      };
    } else {
      const checked = parent.children.map(child => ({[child.id]: true}))
      this.selected = {
        ...this.selected,
        [parent.id]: Object.assign({}, ...checked)
      };
    }
  }

  shouldBeChecked(parent) {
    const selected = this.selected.hasOwnProperty(parent.id) && this.selected[parent.id];
    if (!selected) {
      return false;
    }

    return this.selectedParents[parent.id] = parent.children.length === Object.values(selected).filter(checked => checked).length
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
