'use strict';

import angular from 'angular';

import SpadeDocumentationController from './documentation.controller';

export default angular.module('statEngineApp.spadeDocumentation', [])
  .controller('SpadeDocumentationController', SpadeDocumentationController)
  .name;
