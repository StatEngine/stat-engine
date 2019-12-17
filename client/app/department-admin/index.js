'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './department-admin.routes';
import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

// modules
import departmentAdminHome from './department-admin-home';
import departmentAdminEmail from './department-admin-email';
import departmentAdminCreateNewUser from './department-admin-create-new-user';

export default angular.module('statEngineApp.departmentAdmin', [uiRouter, departmentAdminHome, departmentAdminEmail, departmentAdminCreateNewUser, mongooseError])
  .config(routing)
  .name;
