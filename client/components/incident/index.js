import IncidentMapComponent from './incident-map.component';
import IncidentTimelineComponent from './incident-timeline.component';
import IncidentComparisonGraphComponent from './incident-comparison-graph.component';
import IncidentAlarmHandlingGraphComponent from './incident-alarm-handling-graph.component';
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
      timezone: '<',
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
  .component('incidentComparisonGraph', {
    template: require('./incident-comparison-graph.html'),
    controller: IncidentComparisonGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
      comparison: '<',
    },
  })
  .component('incidentAlarmHandlingGraph', {
    template: require('./incident-alarm-handling-graph.html'),
    controller: IncidentAlarmHandlingGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .name;
