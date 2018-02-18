'use strict';

export default function TwitterResource($resource) {
  'ngInject';

  return $resource('/api/twitter/:verb/:id/', {
    id: '@id'
  }, {
    getTweets: {
      method: 'GET',
      isArray: true,
      params: {
        verb: 'tweets',
      }
    },
    profile: {
      method: 'GET',
      isArray: false,
      params: {
        verb: 'account',
        id: 'profile'
      }
    },
    getTweet: {
      method: 'GET',
      params: {
        verb: 'tweets',
      }
    },
    updateTweet: {
      method: 'PUT',
      params: {
        verb: 'tweets',
      }
    },
    deleteTweet: {
      method: 'DELETE',
      params: {
        verb: 'tweets',
      }
    },
  });
}
