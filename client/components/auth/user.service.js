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
      },
      body: {
        user: 'me',
        newPassword: 'password2',
        oldPassword: 'password1'
      }
    },
    resetpassword: {
      method: 'PUT',
      params: {
        controller: 'resetpassword'
      },
      body: {
        useremail: 'me'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    }
  });
}
