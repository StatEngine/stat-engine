'use strict';

export default function FireDepartmentResource($resource) {
  'ngInject';

  return $resource('/api/fire-departments/:id/:type/:verb', {
    id: '@id'
  }, {
    dataQuality: {
      method: 'GET',
      isArray: false,
      params: {
        id: '@id',
        type: '@type',
        verb: 'data-quality'
      }
    }
  });
}
