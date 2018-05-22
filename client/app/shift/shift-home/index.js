'use strict';

import angular from 'angular';
import ShiftHomeController from './shift-home.controller';

export default angular.module('stateEngineApp.shift.home', [])
  .controller('ShiftHomeController', ShiftHomeController)
  .name;
