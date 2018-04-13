'use strict';

import angular from 'angular';
import EditDeptController from './editdept.controller';

export default angular.module('statEngineApp.editdept', ['statEngineApp.auth', 'ui.router'])
  .controller('EditDeptController', EditDeptController)
  .name;
