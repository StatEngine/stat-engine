'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './nfpa.routes';

// modules
import nfpaHome from './nfpa-home';

export default angular.module('statEngineApp.nfpa', [uiRouter, nfpaHome])
  .config(routing)
  .name;
