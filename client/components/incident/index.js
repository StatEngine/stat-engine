import IncidentMapComponent from './incident-map.component';
import IncidentTimelineComponent from './incident-timeline.component';
import IncidentUnitResponseGraphComponent from './incident-unit-response-graph.component';
import IncidentUnitTravelDurationGraphComponent from './incident-unit-travel-duration-graph.component';

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
  .component('incidentUnitResponseGraph', {
    template: require('./incident-unit-response-graph.html'),
    controller: IncidentUnitResponseGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .component('incidentUnitTravelDurationGraph', {
    template: require('./incident-unit-travel-duration-graph.html'),
    controller: IncidentUnitTravelDurationGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
      travelMatrix: '<',
    },
  })
  .name;
