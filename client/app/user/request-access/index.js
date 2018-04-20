'use strict';

import angular from 'angular';
import RequestAccessController from './request-access.controller';

export default angular.module('stateEngineApp.user.requestAccess', [])
  .controller('RequestAccessController', RequestAccessController)
  .name;
