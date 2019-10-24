'use strict';

export default function PredictionResource($resource) {
  'ngInject';

  return $resource('/api/predictions/:id', {
    id: '@id',
  });
}
