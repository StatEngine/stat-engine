'use strict';

import angular from 'angular';

export class Chip {
  text;
  onRemoveClick;

  handleRemoveClick() {
    if (this.onRemoveClick) {
      this.onRemoveClick();
    }
  }
}

export default angular.module('chip', [])
  .component('chip', {
    template: require('./chip.html'),
    controller: Chip,
    controllerAs: 'vm',
    bindings: {
      text: '<',
      onRemoveClick: '&?',
    },
  })
  .name;
