'use strict';

import angular from 'angular';

export default angular.module('loadingSpinner', [])
  .component('loadingSpinner', {
    template: require('./loading-spinner.component.html'),
  })
  .name
