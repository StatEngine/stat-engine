'use strict';

import angular from 'angular';

export class AppbarComponent {
  constructor($state, $window, $transitions, AmplitudeService, AnalyticEventNames, Principal) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    Principal.identity(true).then(user => {
      this.user = user;
      if(this.user.nfors) {
        $window.document.title = 'NFORS - Powered By StatEngine';
        this.theme = 'nfors';
      }
    });
    this.PrincipalService = Principal;
  }

  signout() {
    this.PrincipalService.logout()
      .finally(() => {
        this.$state.go('site.main.main');
      });
  }

  // eslint-disable-next-line class-methods-use-this
  $onInit() {
    $(document).ready(function() {
      // This will collapsed sidebar menu on left into a mini icon menu
      $('#btnLeftMenu').on('click', function() {
        var menuText = $('.menu-item-label');

        if($('body').hasClass('collapsed-menu')) {
          $('body').removeClass('collapsed-menu');

          // show current sub menu when reverting back from collapsed menu
          $('.show-sub + .br-menu-sub').slideDown();

          $('.br-sideleft').one('transitionend', function() {
            menuText.removeClass('op-lg-0-force');
            menuText.removeClass('d-lg-none');
          });
        } else {
          $('body').addClass('collapsed-menu');

          // hide toggled sub menu
          $('.show-sub + .br-menu-sub').slideUp();

          menuText.addClass('op-lg-0-force');
          $('.br-sideleft').one('transitionend', function() {
            menuText.addClass('d-lg-none');
          });
        }
        return false;
      });

      $('#btnLeftMenuMobile').on('click', function() {
        $('body').addClass('show-sidebar');
        $('.br-sideleft-content').scrollTop(0);
        return false;
      });
    });
  }
}

export default angular.module('appbar', [])
  .component('appbar', {
    template: require('./appbar.component.html'),
    controller: AppbarComponent,
    controllerAs: 'vm',
  })
  .name;
