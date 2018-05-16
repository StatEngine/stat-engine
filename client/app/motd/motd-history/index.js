'use strict';

import angular from 'angular';
import MOTDHistoryController from './motd-history.controller';

export default angular.module('stateEngineApp.motd.history', [])
  .controller('MOTDHistoryController', MOTDHistoryController)
  .name;
