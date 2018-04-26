'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './marketplace.routes';

// modules
import marketplaceHome from './marketplace-home';
import extensionRequest from './extension-request';

export default angular.module('statEngineApp.marketplace', [uiRouter, marketplaceHome, extensionRequest])
  .config(routing)
  .name;
