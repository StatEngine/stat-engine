'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  constructor($state, $scope, $window, Principal, SegmentService) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.PrincipalService = Principal;
    this.SegmentService = SegmentService;

    this.userDropDownActive = false;

    this.currentPrincipal = undefined;
    this.PrincipalService.identity()
      .then(currentPrincipal => {
        this.currentPrincipal = currentPrincipal;
      });

    this.logout = function() {
      this.$state.go('site.main.main');
      this.PrincipalService.logout();
    };

    this.scrollTo = function(location) {
      $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function(location) {
      this.SegmentService.track(this.SegmentService.events.APP_ACCESS, {
        app: 'Dashboard',
        location
      });
      this.$window.location.href = '/dashboard';
    };

    this.goto = function(state, appName) {
      this.userDropDownActive = false;

      if(appName) {
        this.SegmentService.track(this.SegmentService.events.APP_ACCESS, {
          app: appName,
          location: 'navbar-dropdown'
        });
      }
      $state.go(state);
    };

    $scope.$on('$destroy', function () {
      const body = angular.element( document.querySelector( 'body' ) )[0];
      const bodyClasses = body.className.split(' ');
      const noScroll = bodyClasses.indexOf('noScroll');
      if (noScroll > 0) bodyClasses.splice(noScroll, 1);
      body.className = bodyClasses.join(' ');
    });
  }

  openMobile() {
    const x = angular.element( document.querySelector( '#mobileNav' ) )[0];
    const body = angular.element( document.querySelector( 'body' ) )[0];
    const bodyClasses = body.className.split(' ');

    const noScroll = bodyClasses.indexOf('noScroll');

    if (x.className === "mobile-nav open") {
      x.className = "mobile-nav";
      if (noScroll > 0) bodyClasses.splice(noScroll, 1);
    } else {
      x.className = "mobile-nav open";
      bodyClasses.push('noScroll');
    }

    body.className = bodyClasses.join(' ');
  }
}

export default angular.module('directives.nav', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent,
    controllerAs: 'vm',
  })
  .name;
