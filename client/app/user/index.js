'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './user.routes';
import userHome from './user-home';

export default angular.module('statEngineApp.user', [uiRouter, userHome])
  .config(routing)
  .name;
