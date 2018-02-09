'use strict';

import angular from 'angular';

import IntegrationExampleController from './integration-example.controller';

export default angular.module('statEngineApp.integrationExample', [])
  .controller('IntegrationExampleController', IntegrationExampleController)
  .name;
