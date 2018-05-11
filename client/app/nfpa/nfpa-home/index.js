'use strict';

import angular from 'angular';
import NFPAHomeController from './nfpa-home.controller';

export default angular.module('stateEngineApp.nfpa.home', [])
  .controller('NFPAHomeController', NFPAHomeController)
  .name;
