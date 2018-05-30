'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './incident.routes';

// modules
import incidentAnalysis from './incident-analysis';
import incidentSearch from './incident-search';

export default angular.module('statEngineApp.incidents', [uiRouter, incidentAnalysis, incidentSearch])
  .config(routing)
  .name;
