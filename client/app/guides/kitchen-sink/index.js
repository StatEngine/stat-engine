'use strict';

import angular from 'angular';
import ngAria from 'angular-aria';

import KitchenSinkController from './kitchen-sink.controller';

export default angular.module('stateEngineApp.kitchenSink', [])
  .controller('KitchenSinkController', KitchenSinkController)
  .name;
