'use strict';

export default function IncidentResource($resource) {
  'ngInject';

  return $resource('/api/incidents/:id', {
    id: '@id',
  }, {
  });
}
