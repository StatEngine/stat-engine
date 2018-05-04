'use strict';

export default function TwitterResource($resource) {
  'ngInject';

  return $resource('/api/twitter/:resource/:resource2/', {
    id: '@id'
  }, {
    profile: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'account',
        resource2: 'profile'
      }
    },
    getRecommendedTweets: {
      method: 'GET',
      isArray: true,
      params: {
        resource: 'tweets',
        resource2: 'recommendations',
      }
    },
    getRecentTweets: {
      method: 'GET',
      isArray: true,
      params: {
        resource: 'tweets',
        resource2: 'recent',
      }
    },
    previewTweet: {
      method: 'POST',
      params: {
        resource: 'tweets',
        resource2: 'preview'
      }
    },
    tweetTweet: {
      method: 'POST',
      params: {
        resource: 'tweets',
        resource2: 'tweet'
      }
    },
  });
}
