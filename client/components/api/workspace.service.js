'use strict';

export default function WorkspaceResource($resource) {
  'ngInject';

  return $resource('/api/workspaces/:id/:controller/:controllerId', {
    id: '@_id'
  }, {
    updateUsers: {
      method: 'POST',
      params: {
        controller: 'users'
      }
    },
    create: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    updateUserPermissions: {
      method: 'POST',
      params: {
        id: '@id',
        controller: 'users',
        controllerId: '@controllerId',
      }
    },
    revokeUserPermissions: {
      method: 'DELETE',
      params: {
        id: '@id',
        controller: 'users',
        controllerId: '@controllerId',
      }
    },
    updateUserOwnership: {
      method: 'POST',
      params: {
        id: '@id',
        controller: 'owners',
        controllerId: '@controllerId',
      }
    },
    revokeUserOwnership: {
      method: 'DELETE',
      params: {
        id: '@id',
        controller: 'owners',
        controllerId: '@controllerId',
      }
    },
    getDashboards: {
      method: 'GET',
      params: {
        id: '@id',
        controller: 'dashboards',
      },
    },
  });
}
