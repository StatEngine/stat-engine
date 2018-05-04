'use strict';

import angular from 'angular';
import ExtensionRequestController from './extension-request.controller';

export default angular.module('stateEngineApp.extensionRequest', [])
  .controller('ExtensionRequestController', ExtensionRequestController)
  .name;
