'use strict';

import angular from 'angular';
import DepartmentAdminHomeController from './department-admin-home.controller';

export default angular.module('stateEngineApp.departmentAdmin.home', [])
  .controller('DepartmentAdminHomeController', DepartmentAdminHomeController)
  .name;
