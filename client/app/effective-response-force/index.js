'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './effective-response-force.routes';

// modules
import erfAnalysis from './effective-response-force-analysis';

export default angular.module('statEngineApp.erf', [uiRouter, erfAnalysis])
  .config(routing)
  .name;
