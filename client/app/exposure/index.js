'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './exposure.routes';

// modules
import exposureHome from './exposure-home';

export default angular.module('statEngineApp.exposure', [uiRouter, exposureHome])
  .config(routing)
  .name;
