'use strict';

export default function ExtensionResource($resource) {
  'ngInject';

  return $resource('/api/extensions/:id/:verb', {
    id: '@id'
  }, {
    request: {
      method: 'PUT',
      isArray: false,
      params: {
        id: '@id',
        verb: 'request',
      }
    },
  });
}
