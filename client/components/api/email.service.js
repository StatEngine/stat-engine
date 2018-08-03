'use strict';

export default function EmailResource($resource) {
  'ngInject';

  return $resource('/api/email/:id/', {
    id: '@id',
  }, {
    send: {
      method: 'POST',
    },
  });
}
