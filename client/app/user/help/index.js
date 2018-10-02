'use strict';

import angular from 'angular';
import HelpHomeController from './help-home.controller';

export default angular.module('stateEngineApp.help.helpHome', [])
  .controller('HelpHomeController', HelpHomeController)
  .name;
