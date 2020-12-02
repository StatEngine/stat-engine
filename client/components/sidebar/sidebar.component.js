'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class SidebarComponent {
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

    $transitions.onSuccess({}, () => {
      $('body').removeClass('show-sidebar');
    });
  }

  signout() {
    this.PrincipalService.logout()
      .finally(() => {
        this.$state.go('site.main.main');
      });
  }

  dashboard() {
    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
      app: 'Workspaces',
      location: 'sidebar',
    });
    this.$state.go('site.workspace.home');
  }

  customEmails() {
    // this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
    //   app: 'Emails',
    //   location: 'sidebar',
    // });
    console.log('CLICKED EMAILS');
    this.$state.go('site.emails.home');
  }

  // eslint-disable-next-line class-methods-use-this
  $onInit() {
    $(document).ready(function() {
      // This will expand the icon menu when mouse cursor points anywhere
      // inside the sidebar menu on left. This will only trigget to left sidebar
      // when it's in collapsed mode (the icon only menu)
      $(document).on('mouseover', function(e) {
        e.stopPropagation();

        if($('body').hasClass('collapsed-menu') && $('#btnLeftMenu').is(':visible')) {
          var targ = $(e.target).closest('.br-sideleft').length;
          if(targ) {
            $('body').addClass('expand-menu');

            // show current shown sub menu that was hidden from collapsed
            $('.show-sub + .br-menu-sub').slideDown();

            var menuText = $('.menu-item-label');
            menuText.removeClass('d-lg-none');
            menuText.removeClass('op-lg-0-force');
          } else {
            $('body').removeClass('expand-menu');

            // hide current shown menu
            $('.show-sub + .br-menu-sub').slideUp();

            menuText = $('.menu-item-label');
            menuText.addClass('op-lg-0-force');
            menuText.addClass('d-lg-none');
          }
        }
      });

      // This will show sub navigation menu on left sidebar
      // only when that top level menu have a sub menu on it.
      $('.br-menu-link').on('click', function() {
        // eslint-disable-next-line no-invalid-this
        var nextElem = $(this).next();
        // eslint-disable-next-line no-invalid-this
        var thisLink = $(this);

        if(nextElem.hasClass('br-menu-sub')) {
          if(nextElem.is(':visible')) {
            thisLink.removeClass('show-sub');
            nextElem.slideUp();
          } else {
            $('.br-menu-link').each(function() {
              // eslint-disable-next-line no-invalid-this
              $(this).removeClass('show-sub');
            });

            $('.br-menu-sub').each(function() {
              // eslint-disable-next-line no-invalid-this
              $(this).slideUp();
            });

            thisLink.addClass('show-sub');
            nextElem.slideDown();
          }
          return false;
        }
      });
    });
  }

  hideSidebar() {
    $('body').removeClass('show-sidebar');
  }
}

export default angular.module('sidebar', [])
  .component('sidebar', {
    template: require('./sidebar.html'),
    controller: SidebarComponent,
    controllerAs: 'vm',
  })
  .name;
