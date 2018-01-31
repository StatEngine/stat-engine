'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import mongooseError from '../../components/mongoose-error/mongoose-error.directive';

import routing from './account.routes';
import login from './login';
import signup from './signup';

export default angular.module('statEngineApp.account', [uiRouter, login, signup, mongooseError])
  .config(routing)
  .name;
