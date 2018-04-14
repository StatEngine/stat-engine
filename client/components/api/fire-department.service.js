'use strict';

export default function FireDepartmentResource($resource) {
  'ngInject';

  return $resource('/api/fire-departments/:id/:resource/:resource2', {
    id: '@id'
  }, {
    dataQuality: {
      method: 'GET',
      isArray: false,
      params: {
        id: '@id',
        resource: '@type',
        resource2: 'data-quality'
      }
    }
  });
}
