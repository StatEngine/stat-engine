'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './twitter.routes';

// modules
import twitterHome from './twitter-home';

export default angular.module('statEngineApp.twitter', [uiRouter, twitterHome])
  .config(routing)
  .name;
