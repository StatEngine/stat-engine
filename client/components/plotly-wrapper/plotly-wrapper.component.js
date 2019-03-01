'use strict';

import angular from 'angular';

let PlotlyBasic;

export class PlotlyWrapperComponent {
  trace;
  layout;
  initialized = false;

  constructor($scope) {
    'ngInject';

    this.id = $scope.$id.toString();
  }

  async loadModules() {
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
  }

  async $onInit() {
    await this.loadModules();

    PlotlyBasic.newPlot(this.id, this.trace, this.layout, { responsive: true });

    this.initialized = true;
  }

  async $onChanges() {
    if(!this.initialized) {
      return;
    }

    // Update the plot.
    PlotlyBasic.react(this.id, this.trace, this.layout);
  }
}

export default angular.module('plotlyWrapper', [])
  .component('plotlyWrapper', {
    template: require('./plotly-wrapper.html'),
    controller: PlotlyWrapperComponent,
    controllerAs: 'vm',
    bindings: {
      trace: '<',
      layout: '<',
    },
  })
  .name;
