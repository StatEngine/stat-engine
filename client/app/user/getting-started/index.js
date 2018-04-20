'use strict';

import angular from 'angular';
import GettingStartedController from './getting-started.controller';

export default angular.module('stateEngineApp.user.gettingStarted', [])
  .controller('GettingStartedController', GettingStartedController)
  .name;
