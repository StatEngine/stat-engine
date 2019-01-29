'use strict';

export default function IncidentResource($resource) {
  'ngInject';

  return $resource('/api/incidents/:id', {
    id: '@id',
  }, {
    active: {
      method: 'GET',
      isArray: true,
      params: {
        id: '@id',
      }
    },
  });
}
