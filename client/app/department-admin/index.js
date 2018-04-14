'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './department-admin.routes';

// modules
import departmentAdminHome from './department-admin-home';

export default angular.module('statEngineApp.departmentAdmin', [uiRouter, departmentAdminHome,])
  .config(routing)
  .name;
