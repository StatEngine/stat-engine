export default function CustomEmailResource($resource) {
  'ngInject';

  return $resource('/api/custom-email/:id', { id: '@_id' }, {
    listByDeptId: { method: 'GET' },
    find: {
      method: 'GET',
      params: { id: '@id' },
    },
    create: { method: 'POST' },
    update: { method: 'PUT' },
    delete: { method: 'DELETE' },
    preview: {
      method: 'POST',
      params: {
        id: '@id',
        resource: 'preview',
      },
    },
  });
}
