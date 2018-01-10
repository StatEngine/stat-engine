'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './sub.routes';
import kitchenSink from './kitchen-sink';

export default angular.module('statEngineApp.legal', [uiRouter, kitchenSink])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
