'use strict';

export default function NotificationResource($resource) {
  'ngInject';

  return $resource('/api/notify', {}, {
    notify: { method: 'POST' }
  });
}
