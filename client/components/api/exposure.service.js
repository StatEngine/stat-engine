'use strict';

export default function ExposureResource($resource) {
  'ngInject';

  return $resource('/api/exposure/:resource', {}, {
    iac: {
        method: 'GET',
        params: {
          resource: 'iac',
        }
      }
  });
}