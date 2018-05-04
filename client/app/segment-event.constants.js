import angular from 'angular';

export default angular.module('statEngineApp.segmentConstants', [])
  .constant('SegmentEvents', {
    SIGNED_IN: 'Signed In',
    SIGNED_UP: 'Signed Up',
    APP_ACCESS: 'App Access',
    APP_REQUEST: 'App Request',
    APP_ACTION: 'App Action',
  })
  .name;
