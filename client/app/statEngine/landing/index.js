'use strict';

import angular from 'angular';

import StatEngineLandingController from './landing.controller';

export default angular.module('stateEngineApp.statEngine.landing', [])
  .controller('StatEngineLandingController', StatEngineLandingController)
  .name;
