import angular from 'angular';

import IncidentCategoryChartComponent from './incident-category-chart.component';
import IncidentTurnoutCategoryChartComponent from './incident-turnout-category-chart.component';
import IncidentTravelCategoryChartComponent from './incident-travel-category-chart.component';
import IncidentFirstDueTravelDurationChartComponent from './incident-first-due-travel-duration-chart.component';
import IncidentApparatusTimelineComponent from './incident-apparatus-timeline.component';
import EffectiveResponseForceComponent from './effective-response-force.component';

export default angular.module('chart', [])
  .component('incidentCategoryChart', {
    template: require('./incident-category-chart.html'),
    controller: IncidentCategoryChartComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
      tz: '@'
    },
  })
  .component('incidentTurnoutCategoryChart', {
    template: require('./incident-turnout-category-chart.html'),
    controller: IncidentTurnoutCategoryChartComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
      tz: '@'
    },
  })
  .component('incidentTravelCategoryChart', {
    template: require('./incident-travel-category-chart.html'),
    controller: IncidentTravelCategoryChartComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
      tz: '@'
    },
  })
  .component('incidentFirstDueTravelDurationChart', {
    template: require('./incident-first-due-travel-duration-chart.html'),
    controller: IncidentFirstDueTravelDurationChartComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
      tz: '@'
    },
  })
  .component('incidentApparatusTimeline', {
    template: require('./incident-apparatus-timeline.html'),
    controller: IncidentApparatusTimelineComponent,
    controllerAs: 'vm',
    bindings: {
      responses: '<',
      tz: '@'
    },
  })
  .component('effectiveResponseForce', {
    template: require('./effective-response-force.html'),
    controller: EffectiveResponseForceComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
      type: '@'
    },
  })
  .name;
