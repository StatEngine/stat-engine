'use strict';

import angular from 'angular';
import UserSettingsController from './user-settings.controller';

export default angular.module('statEngineApp.userSettings', [])
  .controller('UserSettingsController', UserSettingsController)
  .name;
