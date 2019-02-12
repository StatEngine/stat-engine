'use strict';

export default function UserResource($resource) {
  'ngInject';

  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    requestUsername: {
      method: 'PUT',
      params: {
        controller: 'requestUsername'
      }
    },
    resetPassword: {
      method: 'PUT',
      params: {
        controller: 'resetPassword'
      }
    },
    updatePassword: {
      method: 'PUT',
      params: {
        controller: 'updatePassword'
      }
    },
    requestAccess: {
      method: 'PUT',
      params: {
        controller: 'requestAccess'
      }
    },
    approveAccess: {
      method: 'PUT',
      params: {
        controller: 'approveAccess'
      }
    },
    revokeAccess: {
      method: 'PUT',
      params: {
        controller: 'revokeAccess'
      }
    },
    create: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
