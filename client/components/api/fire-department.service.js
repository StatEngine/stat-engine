'use strict';

export default function FireDepartmentResource($resource) {
  'ngInject';

  return $resource('/api/fire-departments/:id/:resource/:resource2', {
    id: '@id',
  }, {
    dataQuality: {
      method: 'GET',
      isArray: false,
      params: {
        id: '@id',
        resource: '@resource',
        resource2: 'data-quality'
      }
    },
    create: {
      method: 'POST',
    },
    fixtures: {
      method: 'POST',
      params: {
        id: '@id',
        resource: 'fixtures',
        resource2: '@resource2',
      }
    },
    update: {
      method: 'PUT',
    },
  });
}
