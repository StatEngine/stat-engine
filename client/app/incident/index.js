'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './incident.routes';

// modules
import incidentAnalysis from './incident-analysis';

export default angular.module('statEngineApp.incidents', [uiRouter, incidentAnalysis])
  .config(routing)
  .name;
