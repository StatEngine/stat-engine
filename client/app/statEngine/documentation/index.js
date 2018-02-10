'use strict';

import angular from 'angular';

import StatEngineDocumentationController from './documentation.controller';

export default angular.module('statEngineApp.statEngine.documentationController', [])
  .controller('StatEngineDocumentationController', StatEngineDocumentationController)
  .name;
