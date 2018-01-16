'use strict';

import angular from 'angular';

import uiRouter from 'angular-ui-router';

import routing from './guides.routes';
import kitchenSink from './kitchen-sink';
import layoutA from './layout-a';
import layoutB from './layout-b';
import layoutC from './layout-c';

export default angular.module('statEngineApp.guides', [uiRouter, kitchenSink, layoutA, layoutB, layoutC])
  .config(routing)
  .run(function() {
    'ngInject';
  })
  .name;
