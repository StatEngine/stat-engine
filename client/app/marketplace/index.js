'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './marketplace.routes';

// modules
import marketplaceHome from './marketplace-home';
import extension from './extension';

export default angular.module('statEngineApp.extension', [uiRouter, marketplaceHome, extension])
  .config(routing)
  .name;
