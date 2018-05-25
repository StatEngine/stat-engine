import IncidentMapComponent from './incident-map.component';
import IncidentTimelineComponent from './incident-timeline.component';

export default angular.module('incident', [])
  .component('incidentMap', {
    template: require('./incident-map.html'),
    controller: IncidentMapComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .component('incidentTimeline', {
    template: require('./incident-timeline.html'),
    controller: IncidentTimelineComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .name;
