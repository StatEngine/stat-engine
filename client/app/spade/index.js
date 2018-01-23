'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './spade.routes';
import spadeLanding from './landing';
import spadeDocumentation from './documentation';

export default angular.module('statEngineApp.spade', [uiRouter, spadeLanding, spadeDocumentation])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
