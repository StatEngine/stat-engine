import angular from 'angular';

export default angular.module("statEngineApp.segmentConstants", [])
  .constant("SegmentEvents", {
    SIGNED_UP: 'Signed Up',
    KIBANA_ACCESS: 'Kibana Dashboard',
    EXTENSION_REQUEST: 'Extension Request',
  })
.name;
