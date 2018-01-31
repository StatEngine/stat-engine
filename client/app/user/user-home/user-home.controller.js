'use strict';

export default class UserHomeController {
  /*@ngInject*/
  constructor($window, currentPrincipal, currentFireDepartment, dataQuality) {
    this.principal = currentPrincipal;
    this.fireDepartment = currentFireDepartment;
    this.dataQuality = dataQuality;

    const date = new Date().getHours();
    this.greeting = date < 12 ? 'Good Morning' : date < 18 ? 'Good Afternoon' : 'Good Evening';

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function() {
      $window.location.href = '/dashboard';
    };
  }
}
