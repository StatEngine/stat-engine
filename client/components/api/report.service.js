'use strict';

export default function ReportResource($resource) {
  'ngInject';

  return $resource('/api/reports/:type/:name/:action', {
    type: '@type',
    name: '@name',
  }, {
    get: {
      method: 'GET',
      isArray: false,
    },
    update: {
      method: 'PUT',
    },
    view: {
      method: 'POST',
      params: {
        action: 'views'
      }
    },
    getMetrics: {
      method: 'GET',
      isArray: false,
      params: {
        action: 'metrics'
      }
    },
  });
}
