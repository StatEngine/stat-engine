'use strict';

export default function CustomEmailResource($resource) {
  'ngInject';

  return $resource('/api/custom-email/:id/:controller/:controllerId', {
    id: '@_id',
  }, {
    create: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    delete: {
      method: 'Delete',
    },
  });
}
