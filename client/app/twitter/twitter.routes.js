'use strict';

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.twitter', {
      abstract: true,
      template: '<div ui-view />'
    })
    .state('site.twitter.home', {
      url: '/twitter',
      template: require('./twitter-home/twitter-home.html'),
      controller: 'TwitterHomeController',
      data: {
        roles: ['user']
      },
      resolve: {
        tweets(Tweet) {
          return Tweet.query();
        }
      },
      controllerAs: 'vm'
    });
}
