'use strict';

export default function FixtureTemplateResource($resource) {
  'ngInject';

  return $resource('/api/fixture-template/:controller', {}, {
    getDashboards: {
      method: 'GET',
      isArray: true,
      params: {
        controller: 'dashboards',
      },
    },
  });
}
