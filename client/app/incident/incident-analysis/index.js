'use strict';

import angular from 'angular';

import IncidentAnalysisController from './incident-analysis.controller';

export default angular.module('stateEngineApp.incident.analysis', [])
  .controller('IncidentAnalysisController', IncidentAnalysisController)
  .name;
