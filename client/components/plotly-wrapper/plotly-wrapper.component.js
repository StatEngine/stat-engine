'use strict';

import angular from 'angular';

let _;
let PlotlyBasic;

export   class PlotlyWrapperComponent {
  constructor($scope, $window) {
    'ngInject';

    this.$window = $window;
    this.$scope = $scope;

    this.id = $scope.$id.toString();
  }

  async loadModules() {
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  onResize() {
    PlotlyBasic.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  async $onInit() {
    await this.loadModules();

    angular.element(this.$window).on('resize', this.onResize);

    PlotlyBasic.newPlot(this.id, this.trace, this.layout);
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
