'use strict';

import angular from 'angular';

export class ViewModeComponent {
  mode;
  onModeChange;
  modes = {
    list: 'list',
    grid: 'grid',
  };

  $onInit() {
    if(this.mode == null) {
      this.mode = this.modes.list;
    }
  }

  handleListClick() {
    if (this.mode === this.modes.list) {
      return;
    }

    this.mode = this.modes.list;
    this.fireOnModeChange();
  }

  handleGridClick() {
    if (this.mode === this.modes.grid) {
      return;
    }

    this.mode = this.modes.grid;
    this.fireOnModeChange();
  }

  fireOnModeChange() {
    if(this.onModeChange) {
      this.onModeChange({ mode: this.mode });
    }
  }
}

export default angular.module('viewMode', [])
  .component('viewMode', {
    template: require('./view-mode.html'),
    controller: ViewModeComponent,
    controllerAs: 'vm',
    bindings: {
      mode: '=?',
      onModeChange: '&?',
    },
  })
  .name;
