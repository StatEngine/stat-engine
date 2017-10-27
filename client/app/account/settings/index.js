'use strict';

import angular from 'angular';
import SettingsController from './settings.controller';

export default angular.module('statEngineApp.settings', [])
  .controller('SettingsController', SettingsController)
  .name;
