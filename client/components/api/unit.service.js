'use strict';

export default function UnitResource($resource) {
  'ngInject';

  return $resource('/api/units/:id/:resource/:resource2', {
    id: '@_id'
  }, {
    getResponses: {
      method: 'GET',
      params: {
        resource: 'responses',
      },
    },
    getMetrics: {
      method: 'GET',
      params: {
        resource: 'metrics',
      },
    },
    getMetricsTotal: {
      method: 'GET',
      params: {
        resource: 'metrics',
        resource2: 'total',
      },
    }
  });
}
