'use strict';

import angular from 'angular';

import MarketplaceLandingController from './landing-marketplace.controller';

export default angular.module('stateEngineApp.marketplace.Landing', [])
  .controller('MarketplaceLandingController', MarketplaceLandingController)
  .name;
