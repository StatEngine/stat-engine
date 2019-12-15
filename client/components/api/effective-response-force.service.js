'use strict';

export default function ERFResource($resource) {
  'ngInject';

  return $resource('/api/effective-response-force/:resource', {
    id: '@id',
  }, {
    formData: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'formData',
      }
    },
    analysis: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'analysis',
      }
    },
  });
}
