'use strict';

import angular from 'angular';

import MarketplaceLandingController from './landing-marketplace.controller';

export default angular.module('stateEngineApp.marketplaceLanding', [])
  .controller('MarketplaceLandingController', MarketplaceLandingController)
  .name;
