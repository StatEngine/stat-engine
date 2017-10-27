'use strict';

import angular from 'angular';
import {
  UtilService
} from './util.service';

export default angular.module('statEngineApp.util', [])
  .factory('Util', UtilService)
  .name;
