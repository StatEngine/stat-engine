'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './reporting.routes';

// modules
import reportingHome from './reporting-home';

export default angular.module('statEngineApp.reporting', [uiRouter, reportingHome])
  .config(routing)
  .name;
