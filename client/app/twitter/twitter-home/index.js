'use strict';

import angular from 'angular';
import TwitterHomeController from './twitter-home.controller';

export default angular.module('stateEngineApp.twitter.home', [])
  .controller('TwitterHomeController', TwitterHomeController)
  .name;
