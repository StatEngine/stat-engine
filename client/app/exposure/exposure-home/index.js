'use strict';

import angular from 'angular';
import ExposureHomeController from './exposure-home.controller';

export default angular.module('stateEngineApp.exposure.home', [])
  .controller('ExposureHomeController', ExposureHomeController)
  .name;
