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
    create: {
      method: 'POST',
    },
    update: {
      method:'PUT'
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
