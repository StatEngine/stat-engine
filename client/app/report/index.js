'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './report.routes';

// modules
import reportEdit from './report-edit';
import reportView from './report-view';
import reportHistory from './report-history';

export default angular.module('statEngineApp.reports', [uiRouter, reportEdit, reportView, reportHistory])
  .config(routing)
  .name;
