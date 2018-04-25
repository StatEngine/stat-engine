'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './user.routes';

// modules
import userHome from './user-home';
import userSettings from './user-settings';
import settings from './settings';
import requestAccess from './request-access';
import gettingStarted from './getting-started';

export default angular.module('statEngineApp.user', [uiRouter, userHome, userSettings, settings, requestAccess, gettingStarted])
  .config(routing)
  .name;
