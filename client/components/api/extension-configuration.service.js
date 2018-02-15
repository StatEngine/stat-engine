'use strict';

export default function ExtensionConfigurationResource($resource) {
  'ngInject';

  return $resource('/api/extension-configurations/:id', {
    id: '@id'
  }, {
    'enable': { method:'PUT' },
    'disable': { method:'PUT' },
    'update': { method:'PUT' },
  });
};
