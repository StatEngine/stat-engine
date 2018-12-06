'use strict';

export default function StatsResource($resource) {
  'ngInject';

  return $resource('/api/stats/', {
    id: '@id'
  }, {
    get: {
      method: 'GET',
      isArray: false,
    },
  });
}
