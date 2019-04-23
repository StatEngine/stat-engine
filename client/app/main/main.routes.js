'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.main', {
      abstract: true,
      views: {
        'appbar@': {
          template: '',
        },
        'sidebar@': {
          template: '',
        },
        'content@': {
          template: '<div ui-view />',
        },
      },
    })
    .state('site.main.about', {
      url: '/about',
      views: {
        'content@': {
          template: require('./about/about.html'),
        }
      },
    })
    .state('site.main.funding', {
      url: '/funding',
      views: {
        'content@': {
          template: require('./funding/funding.html'),
        }
      },
    })
    .state('site.main.main', {
      url: '/main',
      views: {
        'content@': {
          component: 'main',
        }
      },
    })
    .state('site.main.maintenance', {
      url: '/maintenance',
      views: {
        'content@': {
          template: require('./maintenance/maintenance.html'),
        }
      },
    })
    .state('site.main.termsOfUse', {
      url: '/termsOfUse',
      views: {
        'content@': {
          template: require('./terms-of-use/terms-of-use.html'),
        }
      },
    })
    .state('site.main.partners', {
      url: '/partners',
      views: {
        'content@': {
          template: require('./partners/partners.html'),
          controller: 'PartnersController',
          controllerAs: 'vm'
        }
      },
    });
}
