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
        tweets(Twitter) {
          return Twitter.getTweets().$promise;
        },
        twitterProfile($q, Twitter) {
          var deferred = $q.defer();

          Twitter.profile().$promise
            .then(profile => deferred.resolve(profile))
            .catch(() => deferred.resolve({}));

          return deferred.promise;
        },
      },
      controllerAs: 'vm'
    });
}
