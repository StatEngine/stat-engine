import angular from 'angular';

export default angular.module('statEngineApp.analyticEventName', [])
  .constant('AnalyticEventNames', {
    PAGE_LOAD: 'Loaded A Page',
    SIGNED_IN: 'Signed In',
    SIGNED_UP: 'Signed Up',
    APP_ACCESS: 'App Access',
    APP_REQUEST: 'App Request',
    APP_ACTION: 'App Action',
  })
  .name;
