'use strict';

import angular from 'angular';

import uiRouter from '@uirouter/angularjs';

import routing from './statEngine.routes';
import statengineLanding from './landing';
import statengineDocumentation from './documentation';

export default angular.module('statEngineApp.stateninge', [uiRouter, statengineLanding, statengineDocumentation])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
