'use strict';

export default function MOTDResource($resource) {
  'ngInject';

  return $resource('/api/motd/:year/:month/:date', {
    id: '@id'
  }, {
    get: {
      method: 'GET',
      isArray: false,
    },
  });
}
