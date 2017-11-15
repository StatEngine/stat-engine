'use strict';

export function FireDepartmentResource($resource) {
  'ngInject';

  return $resource('/api/fireDepartments/:id/:controller', {
    id: '@_id'
  }, {});
}
