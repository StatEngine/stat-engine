'use strict';

import angular from 'angular';
import ReportingHomeController from './reporting-home.controller';

export default angular.module('stateEngineApp.reporting.home', [])
  .controller('ReportingHomeController', ReportingHomeController)
  .name;
