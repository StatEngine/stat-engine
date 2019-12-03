'use strict';

export default function FireDepartmentResource($resource) {
  'ngInject';

  return $resource('/api/fire-departments/:id/:resource/:resource2', {
    id: '@id',
  }, {
    dataQuality: {
      method: 'GET',
      isArray: false,
      params: {
        id: '@id',
        resource: '@resource',
        resource2: 'data-quality'
      }
    },
    getUsers: {
      method: 'GET',
      isArray: false,
      params: {
        id: '@id',
        resource: 'users',
      }
    },
    nfpa: {
      method: 'GET',
      isArray: true,
      params: {
        id: '@id',
        resource: '@resource',
        resource2: 'nfpa'
      }
    },
    create: {
      method: 'POST',
    },
    update: {
      method: 'PUT',
    },
    refreshSubscription: {
      method: 'POST',
      params: {
        id: '@id',
        resource: 'refreshSubscription',
      },
    },
  });
}
