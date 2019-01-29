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

    uninstall: {
      method: 'POST',
      params: {
        id: '@id',
        action: 'uninstall'
      }
    },

    status: {
      method: 'GET',
      params: {
        id: '@id',
        action: 'status'
      }
    },
  });
}
