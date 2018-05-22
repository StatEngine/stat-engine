'use strict';

export default function StatsResource($resource) {
  'ngInject';

  return $resource('/api/stats/:resource', {
    id: '@id'
  }, {
    getDaily: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'daily'
      }
    },
  });
}
