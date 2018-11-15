'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './reporting.routes';

// modules
import unitReporting from './reporting-unit';

export default angular.module('statEngineApp.reporting', [uiRouter, unitReporting])
  .config(routing)
  .name;
