'use strict';

import angular from 'angular';

import SpadeDocumentationController from './documentation.controller';

export default angular.module('stateEngineApp.spadeDocumentation', [])
  .controller('SpadeDocumentationController', SpadeDocumentationController)
  .name;
