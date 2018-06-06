'use strict';

import angular from 'angular';

import IncidentSearchController from './incident-search.controller';

export default angular.module('stateEngineApp.incident.search', [])
  .controller('IncidentSearchController', IncidentSearchController)
  .name;
