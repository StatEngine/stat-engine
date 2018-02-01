import angular from 'angular';

export class MainController {
  /*@ngInject*/
  constructor($scope, $window) {
    $scope.requestDemo = function() {
      $window.open('mailto:contact@statengine.io?subject=StateEngine Demo Request', '_self');
    };
  }
}

export default angular.module('statEngineApp.main.main', [])
  .component('main', {
    template: require('./main.html'),
    controller: MainController,
  })
  .name;
