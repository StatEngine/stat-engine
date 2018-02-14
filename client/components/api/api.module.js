'use strict';

import angular from 'angular';

import FireDepartmentResource from './fire-department.service';

export default angular.module('statEngineApp.api', [])
  .factory('FireDepartment', FireDepartmentResource)
  .name;
