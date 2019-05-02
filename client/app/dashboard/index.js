'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './dashboard.routes';

// modules
import tenancy from './dashboard-tenancy';

export default angular.module('statEngineApp.dashboard', [uiRouter, tenancy])
  .config(routing)
  .name;
