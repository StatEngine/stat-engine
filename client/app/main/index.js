'use strict';

import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './main.routes';

import main from './main';
import termsOfUse from './terms-of-use';
import maintenance from './maintenance';
import funding from './funding';

export default angular.module('statEngineApp.main', [uiRouter, main, termsOfUse, maintenance, funding])
  .config(routing)
  .name;
