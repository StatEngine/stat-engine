'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './reporting.routes';

// modules
import unit from './reporting-unit';

export default angular.module('statEngineApp.reporting', [uiRouter, unit])
  .config(routing)
  .name;
