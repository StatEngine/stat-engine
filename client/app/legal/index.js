'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './legal.routes';
import termsOfUse from './terms-of-use';

export default angular.module('statEngineApp.legal', [uiRouter, termsOfUse])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
