'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.main', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.main.about', {
      url: '/about',
      template: require('./about/about.html'),
    })
    .state('site.main.funding', {
      url: '/funding',
      template: require('./funding/funding.html'),
    })
    .state('site.main.main', {
      url: '/main',
      component: 'main',
    })
    .state('site.main.maintenance', {
      url: '/maintenance',
      template: require('./maintenance/maintenance.html'),
    })
    .state('site.main.termsOfUse', {
      url: '/termsOfUse',
      template: require('./terms-of-use/terms-of-use.html'),
    })
    .state('site.main.partners', {
      url: '/partners',
      template: require('./partners/partners.html'),
      controller: 'PartnersController',
      controllerAs: 'vm'
    });
}
