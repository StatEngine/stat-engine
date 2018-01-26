'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.main', {
      'abstract': true,
      template: '<div ui-view />'
    })
    .state('site.main.main', {
      url: '/main',
      component: 'main',
    });
}
