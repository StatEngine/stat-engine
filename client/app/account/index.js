'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

import routing from './account.routes';
import login from './login';
import signup from './signup';
import edituser from './edituser';
import editdept from './editdept';
import resetpassword from './reset';

export default angular.module('statEngineApp.account', [uiRouter, login, signup, edituser, editdept, resetpassword, mongooseError])
  .config(routing)
  .name;
