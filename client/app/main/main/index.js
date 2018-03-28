import angular from 'angular';

export class MainController {
  /*@ngInject*/
  constructor(appConfig) {
    this.appConfig = appConfig;
  }
}

export default angular.module('statEngineApp.main.main', [])
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
    controllerAs: 'vm',
  })
  .name;
