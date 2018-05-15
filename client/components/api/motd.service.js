'use strict';

export default function MOTDResource($resource) {
  'ngInject';

  return $resource('/api/motd/:resource/:resource2/', {
    id: '@id'
  }, {
    getTemplate: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'templates',
      }
    },
  });
}
