'use strict';

import angular from 'angular';
import UserHomeController from './user-home.controller';

export default angular.module('stateEngineApp.user.home', [])
  .controller('UserHomeController', UserHomeController)
  .name;
