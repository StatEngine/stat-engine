import angular from 'angular';

import IncidentMapComponent from './incident-map.component';
import IncidentTimelineComponent from './incident-timeline.component';
import IncidentComparisonGraphComponent from './incident-comparison-graph.component';
import IncidentAlarmProcessingGraphComponent from './incident-alarm-processing-graph.component';
import IncidentAlarmAnsweringGraphComponent from './incident-alarm-answering-graph.component';
import IncidentUnitResponseGraphComponent from './incident-unit-response-graph.component';
import IncidentUnitTravelDurationGraphComponent from './incident-unit-travel-duration-graph.component';
import IncidentUnitTravelDistanceGraphComponent from './incident-unit-travel-distance-graph.component';

export default angular.module('incident', [])
  .component('incidentMap', {
    template: require('./incident-map.html'),
    controller: IncidentMapComponent,
    controllerAs: 'vm',
    bindings: {
      incidents: '<',
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
  .component('incidentAlarmProcessingGraph', {
    template: require('./incident-alarm-processing-graph.html'),
    controller: IncidentAlarmProcessingGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .component('incidentAlarmAnsweringGraph', {
    template: require('./incident-alarm-answering-graph.html'),
    controller: IncidentAlarmAnsweringGraphComponent,
    controllerAs: 'vm',
    bindings: {
      incident: '<',
    },
  })
  .name;
