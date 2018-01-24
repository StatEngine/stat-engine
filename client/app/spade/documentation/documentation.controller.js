'use strict';

export default class SpadeDocumentationController {
  /*@ngInject*/
  constructor($scope) {
    $scope.sectionOpen = undefined;

    $scope.scrollTo = function(location) {
      $scope.sectionOpen = location;
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };
  }
}
