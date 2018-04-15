'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './admin.routes';
import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

// modules
import adminHome from './admin-home';
import fireDepartment from './fire-department';
import user from './user';

export default angular.module('statEngineApp.admin', [uiRouter, adminHome, fireDepartment, user, mongooseError])
  .config(routing)
  .name;
