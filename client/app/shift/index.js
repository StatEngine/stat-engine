'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './shift.routes';

// modules
import shiftHome from './shift-home';

export default angular.module('statEngineApp.shift', [uiRouter, shiftHome])
  .config(routing)
  .name;
