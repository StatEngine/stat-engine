'use strict';

import angular from 'angular';
import moveupHomeController from './moveup-home.controller';

export default angular.module('stateEngineApp.moveup.home', [])
  .controller('MoveupHomeController', moveupHomeController)
  .name;