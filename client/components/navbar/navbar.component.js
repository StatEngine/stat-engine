'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class NavbarComponent {
  openDropdowns = {};

  constructor($state, $scope, $window, $timeout, Principal, AmplitudeService, AnalyticEventNames, appConfig) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.$timeout = $timeout;
    this.PrincipalService = Principal;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.appConfig = appConfig;

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
      $('.app-content-view').animate({ scrollTop: $(location).offset().top }, 1000);
    };

    this.dashboard = function(location) {
      this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
        app: 'Dashboard',
        location
      });
      this.$window.location.href = '/workspace';
    };

    this.goto = (state, appName) => {
      if(appName) {
        this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
          app: appName,
          location: 'navbar-dropdown'
        });
      }
      $state.go(state);
    };

    angular.element('.mobile-nav-overlay').on('click', () => {
      this.hideMobileNav();
    });

    // HACK: There's a bug in some browsers where animations will break descendant 'fixed' position elements.
    // So remove the 'animated' class once it completes to avoid breaking the mobile nav.
    setTimeout(() => {
      angular.element('navbar').removeClass('animated');
    }, 1000);
  }

  $onDestroy() {
    this.hideMobileNav();
    angular.element('.mobile-nav-overlay').off('click');
  }

  showMobileNav() {
    angular.element('body').addClass('show-mobile-nav');
  }

  hideMobileNav() {
    angular.element('body').removeClass('show-mobile-nav');
  }

  openDropdown(dropdownId) {
    if (this.openDropdowns[dropdownId]) {
      return;
    }

    this.openDropdowns[dropdownId] = {
      close: () => {
        this.$window.removeEventListener('click', this.openDropdowns[dropdownId].close);
        this.$timeout(() => {
          delete this.openDropdowns[dropdownId];
        });
      },
    };

    this.$timeout(() => {
      this.$window.addEventListener('click', this.openDropdowns[dropdownId].close);
    });
  }
}

export default angular.module('directives.nav', [])
  .component('navbar', {
    template: require('./navbar.html'),
    controller: NavbarComponent,
    controllerAs: 'vm',
  })
  .name;
