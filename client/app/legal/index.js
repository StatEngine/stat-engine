'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './legal.routes';
import termsOfUse from './terms-of-use';
import maintenance from './maintenance';

export default angular.module('statEngineApp.legal', [uiRouter, termsOfUse, maintenance])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
