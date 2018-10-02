'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

export class SidebarComponent {
  constructor($state, $window, AmplitudeService, AnalyticEventNames, Principal) {
    'ngInject';

    this.$state = $state;
    this.$window = $window;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    Principal.identity(true).then((user) => {
      this.user = user;
    })
    this.PrincipalService = Principal;
  }

  signout() {
    this.PrincipalService.logout()
      .finally(() => {
        this.$state.go('site.main.main');
      })
  };

  dashboard() {
    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACCESS, {
      app: 'Dashboard',
      location: 'sidebar',
    });
    this.$window.location.href = '/dashboard';
  };

  $onInit() {
    $(document).ready(function(){
     // This will collapsed sidebar menu on left into a mini icon menu
     $('#btnLeftMenu').on('click', function(){
       var menuText = $('.menu-item-label');

       if($('body').hasClass('collapsed-menu')) {
         $('body').removeClass('collapsed-menu');

         // show current sub menu when reverting back from collapsed menu
         $('.show-sub + .br-menu-sub').slideDown();

         $('.br-sideleft').one('transitionend', function(e) {
           menuText.removeClass('op-lg-0-force');
           menuText.removeClass('d-lg-none');
         });

       } else {
         $('body').addClass('collapsed-menu');

         // hide toggled sub menu
         $('.show-sub + .br-menu-sub').slideUp();

         menuText.addClass('op-lg-0-force');
         $('.br-sideleft').one('transitionend', function(e) {
           menuText.addClass('d-lg-none');
         });
       }
       return false;
     });

     // This will expand the icon menu when mouse cursor points anywhere
     // inside the sidebar menu on left. This will only trigget to left sidebar
     // when it's in collapsed mode (the icon only menu)
     $(document).on('mouseover', function(e){
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

           var menuText = $('.menu-item-label');
           menuText.addClass('op-lg-0-force');
           menuText.addClass('d-lg-none');
         }
       }
     });

     // This will show sub navigation menu on left sidebar
     // only when that top level menu have a sub menu on it.
     $('.br-menu-link').on('click', function(){
       var nextElem = $(this).next();
       var thisLink = $(this);

       if(nextElem.hasClass('br-menu-sub')) {

         if(nextElem.is(':visible')) {
           thisLink.removeClass('show-sub');
           nextElem.slideUp();
         } else {
           $('.br-menu-link').each(function(){
             $(this).removeClass('show-sub');
           });

           $('.br-menu-sub').each(function(){
             $(this).slideUp();
           });

           thisLink.addClass('show-sub');
           nextElem.slideDown();
         }
         return false;
       }
     });

     $('#btnLeftMenuMobile').on('click', function(){
       $('body').addClass('show-left');
       return false;
     });

     // This will hide sidebar when it's clicked outside of it
     $(document).on('click', function(e){
       e.stopPropagation();

       // closing left sidebar
       if($('body').hasClass('show-left')) {
         var targ = $(e.target).closest('.br-sideleft').length;
         if(!targ) {
           $('body').removeClass('show-left');
         }
       }

       // closing right sidebar
       if($('body').hasClass('show-right')) {
         var targ = $(e.target).closest('.br-sideright').length;
         if(!targ) {
           $('body').removeClass('show-right');
         }
       }
     });
   });
  }
}

export default angular.module('directives.sidebar', [])
  .component('sidebar', {
    template: require('./sidebar.html'),
    controller: SidebarComponent,
    controllerAs: 'vm',
  })
  .name;
