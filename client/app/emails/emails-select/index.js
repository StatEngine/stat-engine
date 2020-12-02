'use strict';

import angular from 'angular';
import EmailsSelectController from './emails-select.controller';

export default angular.module('stateEngineApp.emails.select', [])
  .controller('EmailsSelectController', EmailsSelectController)
  .name;
