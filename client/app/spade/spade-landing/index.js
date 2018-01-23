'use strict';

import angular from 'angular';

import SpadeLandingController from './spade-landing.controller';

export default angular.module('stateEngineApp.spadeLanding', [])
  .controller('SpadeLandingController', SpadeLandingController)
  .name;
