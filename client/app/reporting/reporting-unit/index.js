'use strict';

import angular from 'angular';
import ReportingUnitController from './reporting-unit.controller';
import incidentsTable from '../../../components/incidents-table/incidents-table.component';

export default angular.module('stateEngineApp.reporting.unit', [incidentsTable])
  .controller('ReportingUnitController', ReportingUnitController)
  .name;
