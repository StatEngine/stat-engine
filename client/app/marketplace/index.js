'use strict';

import angular from 'angular';

import uiRouter from '@uirouter/angularjs';

import routing from './marketplace.routes';
import marketplaceLanding from './landing-marketplace';
import integrationExample from './integration-example';

export default angular.module('statEngineApp.spade', [uiRouter, marketplaceLanding, integrationExample])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
