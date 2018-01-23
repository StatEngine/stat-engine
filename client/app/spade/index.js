'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './spade.routes';
import spadeLanding from './spade-landing';

export default angular.module('statEngineApp.spade', [uiRouter, spadeLanding])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
