'use strict';

import angular from 'angular';
import ReportMetricsController from './report-metrics.controller';

export default angular.module('stateEngineApp.reports.metrics', [])
  .controller('ReportMetricsController', ReportMetricsController)
  .name;
