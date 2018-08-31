'use strict';

import angular from 'angular';

import KitchenSinkController from './kitchen-sink.controller';

export default angular.module('stateEngineApp.kitchenSink', [])
  .controller('KitchenSinkController', KitchenSinkController)
  .name;
