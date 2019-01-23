'use strict';

export default function AppsResource($resource) {
  'ngInject';

  return $resource('/api/apps/:id', {
    id: '@id'
  }, {
  });
}
