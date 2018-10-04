import angular from 'angular';

import IncidentCategoryChartComponent from './incident-category-chart.component';

export default angular.module('chart', [])
  .component('incidentCategoryChart', {
    template: require('./incident-category-chart.html'),
    controller: IncidentCategoryChartComponent,
    controllerAs: 'vm',
    bindings: {
      data: '<',
    },
  })
  .name;
