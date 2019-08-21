'use strict';

import angular from 'angular';

import KibanaService from './kibana.service';

export default angular.module('statEngineApp.kibana', [])
  .factory('KibanaService', KibanaService)
  .name;
