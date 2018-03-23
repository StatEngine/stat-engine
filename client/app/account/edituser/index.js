'use strict';

import angular from 'angular';
import EditUserController from './edituser.controller';

export default angular.module('statEngineApp.edituser', [])
  .controller('EditUserController', EditUserController)
  .name;
