'use strict';

let _;

import angular from 'angular';
import MarketplaceHomeController from './marketplace-home.controller';

export default angular.module('stateEngineApp.marketplace.home', [])
  .controller('MarketplaceHomeController', MarketplaceHomeController)
  .name;
