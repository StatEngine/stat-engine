'use strict';

import angular from 'angular';

import uiRouter from '@uirouter/angularjs';

import routing from './spade.routes';
import spadeLanding from './landing';
import spadeDocumentation from './documentation';

export default angular.module('statEngineApp.spade', [uiRouter, spadeLanding, spadeDocumentation])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
