'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './motd.routes';

// modules
import motdHome from './motd-home';
import motdDaily from './motd-daily';
import motdHistory from './motd-history';

export default angular.module('statEngineApp.motd', [uiRouter, motdHome, motdDaily, motdHistory])
  .config(routing)
  .name;
