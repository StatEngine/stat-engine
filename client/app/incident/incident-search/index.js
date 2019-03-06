'use strict';

import angular from 'angular';

import IncidentSearchController from './incident-search.controller';
import incidentsTable from '../../../components/incidents-table/incidents-table.component';

export default angular.module('stateEngineApp.incident.search', [incidentsTable])
  .controller('IncidentSearchController', IncidentSearchController)
  .name;
