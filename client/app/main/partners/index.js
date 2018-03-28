'use strict';

import angular from 'angular';

export class PartnersController {
  /*@ngInject*/
  constructor(appConfig) {
    this.appConfig = appConfig;
  }
}

export default angular.module('stateEngineApp.main.partners', [])
  .controller('PartnersController', PartnersController)
  .name;
