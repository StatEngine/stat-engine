'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './motd.routes';

// modules
import motdHome from './motd-home';

export default angular.module('statEngineApp.motd', [uiRouter, motdHome])
  .config(routing)
  .name;
