'use strict';

import angular from 'angular';
import UserLandingController from './user-landing.controller';

export default angular.module('stateEngineApp.userLanding', [])
  .controller('UserLandingController', UserLandingController)
  .name;
