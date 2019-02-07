'use strict';

import angular from 'angular';

export class LoadingOverlayController {
  spinnerSize;
  showSpinner;
  spinnerStyle;

  $onInit() {
    this.spinnerSize = this.spinnerSize || 80;
    this.showSpinner = (!_.isUndefined(this.showSpinner)) ? this.showSpinner : true;

    this.spinnerStyle = {
      width: `${this.spinnerSize}px`,
      height: `${this.spinnerSize}px`,
    };
  }
}

export default angular.module('loadingOverlay', [])
  .component('loadingOverlay', {
    template: require('./loading-overlay.component.html'),
    controller: LoadingOverlayController,
    controllerAs: 'vm',
    bindings: {
      spinnerSize: '<?',
      showSpinner: '<?',
    },
  })
  .name
