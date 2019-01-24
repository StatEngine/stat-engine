'use strict';

export default function AppsResource($resource) {
  'ngInject';

  return $resource('/api/apps/:id/:action', {
    id: '@id'
  }, {
    install: {
      method: 'POST',
      params: {
        id: '@id',
        action: 'install'
      }
    },
  });
}
