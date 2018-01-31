import angular from 'angular';
import uiRouter from '@uirouter/angularjs';

import routing from './main.routes';

export class MainController {
  /*@ngInject*/
  constructor($scope, $window) {
    $scope.requestDemo = function() {
      $window.open('mailto:contact@statengine.io?subject=StateEngine Demo Request', '_self');
    };
  }
}

export default angular.module('statEngineApp.main', [uiRouter])
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
  })
  .config(routing)
  .name;
