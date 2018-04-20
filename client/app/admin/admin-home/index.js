'use strict';

import angular from 'angular';
import AdminHomeController from './admin-home.controller';

export default angular.module('stateEngineApp.admin.home', [])
  .controller('AdminHomeController', AdminHomeController)
  .name;
