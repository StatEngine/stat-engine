'use strict';

import angular from 'angular';
import UserController from './user.controller';

export default angular.module('statEngineApp.admin.user', [])
  .controller('UserController', UserController)
  .name;
