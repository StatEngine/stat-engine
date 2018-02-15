'use strict';

export default function TweetResource($resource) {
  'ngInject';

  return $resource('/api/tweets/:id/', {
    id: '@id'
  }, {
    update: { method: 'PUT' },
  });
}
