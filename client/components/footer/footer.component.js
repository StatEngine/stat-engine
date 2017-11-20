import angular from 'angular';

export class FooterComponent {
  constructor($scope) {
    $scope.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };
  }
}

export default angular.module('directives.footer', [])
  .component('footer', {
    template: require('./footer.html'),
    controller: FooterComponent
  })
  .name;
