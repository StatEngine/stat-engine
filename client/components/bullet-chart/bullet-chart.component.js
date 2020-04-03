'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';

let Plotly;

export class BulletChartComponent {
  text;
  value;
  threshold;
  steps;
  bar;

  isInitialized = false;

  constructor($element) {
    'ngInject';

    this.$element = $element;
  }

  async loadModules() {
    Plotly = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-finance.js');
  }

  async $onInit() {
    await this.loadModules();

    Plotly.newPlot(this.$element.find('.bullet-chart-graph')[0], this.data, this.layout, {
      displayModeBar: false,
      responsive: true,
    });

    this.isInitialized = true;
  }

  $onChanges() {
    if (!this.isInitialized) {
      return;
    }

    Plotly.react(this.$element.find('.bullet-chart-graph')[0], this.data, this.layout);
  }

  get data() {
    return [{
      type: 'indicator',
      mode: 'gauge',
      value: this.bar.value,
      domain: { x: [0, 1], y: [0, 1] },
      gauge: {
        shape: 'bullet',
        axis: { range: [null, this.steps.slice(-1)[0].value] },
        bar: {
          color: this.bar.color,
          thickness: 0.4,
        },
        threshold: {
          line: { color: this.threshold.color, width: 3 },
          thickness: 0.75,
          value: this.threshold.value,
        },
        steps: this.steps.map((step, i) => {
          const start = (i > 0) ? this.steps[i-1].value : 0;
          return {
            range: [start, step.value],
            color: step.color,
          };
        }),
      }
    }]
  }

  get layout() {
    return {
      height: 20,
      margin: {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
      },
    };
  }
}

export default angular.module('directives.bulletChart', [])
  .component('bulletChart', {
    template: require('./bullet-chart.html'),
    controller: BulletChartComponent,
    controllerAs: 'vm',
    bindings: {
      text: '@',
      value: '<',
      threshold: '<',
      steps: '<',
      bar: '<',
    },
  })
  .name;
