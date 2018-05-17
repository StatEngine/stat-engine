'use strict';

export default function ReportResource($resource) {
  'ngInject';

  return $resource('/api/reports/:type/:name/', {
    id: '@id'
  }, {
    get: {
      method: 'GET',
      isArray: false,
    },
    update: {
      method: 'PUT'
    }
  });
}
