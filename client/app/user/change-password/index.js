'use strict';

import angular from 'angular';
import ChangePasswordController from './change-password.controller';

export default angular.module('statEngineApp.user.changePassword', [])
  .controller('ChangePasswordController', ChangePasswordController)
  .name;
