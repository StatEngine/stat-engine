'use strict';

export default function ExtensionResource($resource) {
  'ngInject';

  return $resource('/api/extensions/:id', {
    id: '@id'
  }, {
  });
}
