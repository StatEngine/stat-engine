'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './move-up.routes';

// modules
import moveupHome from './moveup-home';

export default angular.module('statEngineApp.moveup', [uiRouter, moveupHome])
  .config(routing)
  .name;