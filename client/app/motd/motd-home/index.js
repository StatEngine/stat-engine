'use strict';

import angular from 'angular';
import MOTDHomeController from './motd-home.controller';

export default angular.module('stateEngineApp.motd.home', [])
  .controller('MOTDHomeController', MOTDHomeController)
  .name;
