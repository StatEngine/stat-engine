'use strict';

export default function WorkspaceResource($resource) {
  'ngInject';

  return $resource('/api/workspaces/:id/:controller', {
    id: '@_id'
  }, {
    updateUsers: {
      method: 'POST',
      params: {
        controller: 'users'
      }
    },
    update: {
      method: 'PUT',
    },
  });
}
