'use strict';

import angular from 'angular';
import ReportViewController from './report-view.controller';

export default angular.module('stateEngineApp.reports.view', [])
  .controller('ReportViewController', ReportViewController)
  .name;
