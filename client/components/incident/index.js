import IncidentMapComponent from './incident-map.component';
import IncidentTimelineComponent from './incident-timeline.component';
import IncidentAlarmProcessingGraphComponent from './incident-alarm-processing-graph.component';
import IncidentUnitResponseGraphComponent from './incident-unit-response-graph.component';
import IncidentUnitTravelDurationGraphComponent from './incident-unit-travel-duration-graph.component';
import IncidentUnitTravelDistanceGraphComponent from './incident-unit-travel-distance-graph.component';

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
  .component('incidentUnitTravelDistanceGraph', {
    template: require('./incident-unit-travel-distance-graph.html'),
    controller: IncidentUnitTravelDistanceGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
      travelMatrix: '<',
    },
  })
  .component('incidentAlarmProcessingGraph', {
    template: require('./incident-alarm-processing-graph.html'),
    controller: IncidentAlarmProcessingGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .name;
