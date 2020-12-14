'use strict';

export default function CustomEmailResource($resource) {
  'ngInject';

  return $resource('/api/custom-email/:id', {
    id: '@_id',
  }, {
    listByDeptId: {
      method: 'GET',
    },
    find: {
      method: 'GET',
      params: {
        id: '@id',
      },
    },
    create: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    delete: {
      method: 'DELETE',
    },
  });
}
