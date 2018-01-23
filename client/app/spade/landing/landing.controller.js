'use strict';

export default class SpadeLandingController {
  /*@ngInject*/
  constructor($http, $scope, $window) {
    this.$http = $http;
    //this.socket = socket;

    $scope.$on('$destroy', function() {
    });

    $scope.viewProminentEdge = function() {
      $window.open('https://prominentedge.com/?utm_source=statengine&utm_medium=spade%20product%20page', '_blank');
    };
  }

  $onInit() {
  }
}
