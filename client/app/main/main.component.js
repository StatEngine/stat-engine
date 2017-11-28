import angular from 'angular';
import uiRouter from 'angular-ui-router';
import routing from './main.routes';

export class MainController {
  /*@ngInject*/
  constructor($http, $scope, $window) {
    this.$http = $http;
    //this.socket = socket;

    $scope.$on('$destroy', function() {
    });

    $scope.requestDemo = function() {
      $window.open('mailto:contact@statengine.io?subject=StateEngine Demo Request', '_self');
    };
  }

  $onInit() {
  }
}

export default angular.module('statEngineApp.main', [uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;
