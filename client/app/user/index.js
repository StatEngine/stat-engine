'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './user.routes';

// modules
import userHome from './user-home';
import settings from './settings';

export default angular.module('statEngineApp.user', [uiRouter, userHome, settings])
  .config(routing)
  .name;
