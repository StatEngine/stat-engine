'use strict';

export default function WeatherResource($resource) {
  'ngInject';

  return $resource('/api/weather/:resource', {
    id: '@id'
  }, {
    getForecast: {
      method: 'GET',
      isArray: false,
      params: {
        resource: 'forecast',
      }
    },
  });
}
