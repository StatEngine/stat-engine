'use strict';

import angular from 'angular';

import SpadeLandingController from './landing.controller';

export default angular.module('stateEngineApp.spadeLanding', [])
  .controller('SpadeLandingController', SpadeLandingController)
  .name;
