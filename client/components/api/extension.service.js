'use strict';

export function ExtensionResource($resource) {
  'ngInject';

  return $resource('/api/extensions/:id', {
    id: '@id'
  }, {
  })
};
