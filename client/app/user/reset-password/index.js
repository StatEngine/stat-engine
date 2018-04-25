'use strict';

import angular from 'angular';
import ResetPasswordController from './reset-password.controller';

export default angular.module('statEngineApp.user.resetPassword', [])
  .controller('ResetPasswordController', ResetPasswordController)
  .name;
