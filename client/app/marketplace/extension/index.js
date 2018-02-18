'use strict';

import angular from 'angular';
import ExtensionController from './extension.controller';

export default angular.module('stateEngineApp.extension', [])
  .controller('ExtensionController', ExtensionController)
  .name;
