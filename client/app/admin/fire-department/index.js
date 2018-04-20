'use strict';

import angular from 'angular';
import FireDepartmentController from './fire-department.controller';

export default angular.module('statEngineApp.admin.fireDepartment', [])
  .controller('FireDepartmentController', FireDepartmentController)
  .name;
