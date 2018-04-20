'use strict';

import angular from 'angular';
import ResetPasswordController from './resetpass.controller';

export default angular.module('statEngineApp.resetpassword', [])
  .controller('ResetPasswordController', ResetPasswordController)
  .name;
