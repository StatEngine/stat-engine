'use strict';

import angular from 'angular';

import AmplitudeService from './amplitude.service';

export default angular.module('statEngineApp.amplitude', [])
  .factory('AmplitudeService', AmplitudeService)
  .name;
