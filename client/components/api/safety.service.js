'use strict';

export default function SafetyResource($resource) {
  'ngInject';

  return $resource('/api/safety', {
    id: '@id'
  }, {
    getRandomMessage: {
      method: 'GET',
      isArray: false,
    },
  });
}
