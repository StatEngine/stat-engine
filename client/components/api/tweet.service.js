'use strict';

export function TweetResource($resource) {
  'ngInject';

  return $resource('/api/tweets/:id/', {
    id: '@id'
  }, {
    'update': { method:'PUT' },
  })
};
