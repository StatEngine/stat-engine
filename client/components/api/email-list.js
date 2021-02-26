export default function EmailListResource($resource) {
  'ngInject';

  return $resource('/api/email-list', null, { emailList: { method: 'GET' } });
}
