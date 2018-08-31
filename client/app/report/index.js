'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import 'angular-summernote/dist/angular-summernote.js';

import routing from './report.routes';

// modules
import reportEdit from './report-edit';
import reportView from './report-view';
import reportMetrics from './report-metrics';
import reportHistory from './report-history';

export default angular.module('statEngineApp.reports', [uiRouter, reportEdit, reportView, reportHistory, reportMetrics, 'summernote'])
  .config(routing)
  .name;
