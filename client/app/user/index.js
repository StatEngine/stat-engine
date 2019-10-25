'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './user.routes';

// modules
import userHome from './user-home';
import userSettings from './user-settings';
import requestAccess from './request-access';
import gettingStarted from './getting-started';
import help from './help';
import training from './training';

export default angular.module('statEngineApp.user', [uiRouter, userHome, userSettings, requestAccess, gettingStarted, help, training])
  .config(routing)
  .name;
