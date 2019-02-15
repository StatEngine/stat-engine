'use strict';

import angular from 'angular';
import ForgotUsernameController from './forgot-username.controller';

export default angular.module('statEngineApp.forgotUsername', [])
  .controller('ForgotUsernameController', ForgotUsernameController)
  .name;
