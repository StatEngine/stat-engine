'use strict';

import angular from 'angular';
import UserHomeController from './user-home.controller';
import validationCheck from '../../../components/validation-check/validation-check.component';
  
export default angular.module('stateEngineApp.user.home', [validationCheck])
  .controller('UserHomeController', UserHomeController)
  .name;
