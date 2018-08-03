'use strict';

import angular from 'angular';
import DepartmentAdminEmailController from './department-admin-email.controller';

export default angular.module('stateEngineApp.departmentAdmin.email', [])
  .controller('DepartmentAdminEmailController', DepartmentAdminEmailController)
  .name;
