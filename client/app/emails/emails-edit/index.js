'use strict';

import angular from 'angular';
import EmailsEditController from './emails-edit.controller';

export default angular.module('stateEngineApp.emails.edit', [])
  .controller('EmailsEditController', EmailsEditController)
  .name;
