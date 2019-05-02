'use strict';

import angular from 'angular';
import DashboardTenancyController from './dashboard-tenancy.controller';

export default angular.module('stateEngineApp.dashboard.tenancy', [])
  .controller('DashboardTenancyController', DashboardTenancyController)
  .name;
