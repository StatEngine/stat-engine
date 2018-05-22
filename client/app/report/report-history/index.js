'use strict';

import angular from 'angular';
import ReportHistoryController from './report-history.controller';

export default angular.module('stateEngineApp.report.history', [])
  .controller('ReportHistoryController', ReportHistoryController)
  .name;
