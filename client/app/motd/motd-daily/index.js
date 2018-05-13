'use strict';

import angular from 'angular';
import MOTDDailyController from './motd-daily.controller';

export default angular.module('stateEngineApp.motd.daily', [])
  .controller('MOTDDailyController', MOTDDailyController)
  .name;
