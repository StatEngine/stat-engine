'use strict';

export function ExtensionConfigurationResource($resource) {
  'ngInject';

  return $resource('/api/extension-configurations/:id', {
    id: '@id'
  }, {
  })
};
