'use strict';

let _;

export default function routes($stateProvider) {
  'ngInject';

  $stateProvider
    .state('site.twitter', {
      abstract: true,
    })
    .state('site.twitter.home', {
      url: '/twitter',
      views: {
        'content@': {
          template: require('./twitter-home/twitter-home.html'),
          controller: 'TwitterHomeController',
          controllerAs: 'vm'
        },
      },
      data: {
        roles: ['user']
      },
      resolve: {
        deps($ocLazyLoad) {
          return Promise.all([
            import(/* webpackChunkName: "ui-grid" */ 'angular-ui-grid/ui-grid').then(() => $ocLazyLoad.inject('ui.grid')),
            import(/* webpackChunkName: "lodash" */ 'lodash').then(mod => { _ = mod; })

          ]);
        },
        twitterProfile($q, Twitter) {
          var deferred = $q.defer();

          Twitter.profile().$promise
            .then(profile => deferred.resolve(profile))
            .catch(() => deferred.resolve({}));

          return deferred.promise;
        },
        recommendedTweets(twitterProfile, Twitter) {
          if(!_.isEmpty(twitterProfile)) return Twitter.getRecommendedTweets().$promise;
        },
        recentTweets(twitterProfile, Twitter) {
          if(!_.isEmpty(twitterProfile)) return Twitter.getRecentTweets().$promise;
        },
      },
    });
}
