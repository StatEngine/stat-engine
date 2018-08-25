'use strict';

import angular from 'angular';
import 'babel-polyfill';

import _ from 'lodash';

let PlotlyBasic;

export default class IncidentComparisonGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-comparison-graph';
  }

  async loadModules() {
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
  }

  onResize() {
    PlotlyBasic.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  async $onInit() {
    await this.loadModules();

    const y = [];
    const ninetyPercent = [];
    const ninetyPercentText = [];
    const seventyFivePercent = [];
    const seventyFivePercentText = [];

    const responseDuration = _.get(this.incident, 'durations.response.seconds');
    _.forOwn(this.comparison, (data, key) => {
      let value90 = _.get(data, 'response_duration_percentile_rank.values[\'90.0\']');
      let value75 = _.get(data, 'response_duration_percentile_rank.values[\'75.0\']');
      if(value90 && value75) {
        y.push(key);
        ninetyPercent.push(value90);
        ninetyPercentText.push(`${key}: ${data.comparison_value}<br>${value90.toFixed(2)}`);
        seventyFivePercent.push(value75);
        seventyFivePercentText.push(`${key}: ${data.comparison_value}<br>${value75.toFixed(2)}`);
      }
    });

    const shapes = [];
    shapes.push({
      type: 'line',
      x0: responseDuration,
      x1: responseDuration,
      y0: -1,
      y1: y.length,
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
      name: this.incident.description.incident_number || 'This incident'
    });

    PlotlyBasic.newPlot(this.id, [{
      x: seventyFivePercent,
      y,
      text: seventyFivePercentText,
      mode: 'markers',
      marker: {
        color: '#3eceb0',
        line: {
          color: 'rgba(156, 165, 196, 1.0)',
          width: 1,
        },
        symbol: 'circle',
        size: 16
      },
      name: '75% Percentile'
    }, {
      x: ninetyPercent,
      y,
      text: ninetyPercentText,
      mode: 'markers',
      marker: {
        color: '#44a0c1',
        line: {
          color: 'rgba(156, 165, 196, 1.0)',
          width: 1,
        },
        symbol: 'circle',
        size: 16
      },
      name: '90% Percentile'
    }], {
      shapes,
      annotations: [{
        x: responseDuration,
        y: y.length + 0.2,
        text: this.incident.description.incident_number || 'This incident',
        showarrow: false,
        font: {
          color: '#e91276'
        },
      }],
      height: 290,
      margin: {
        l: 100,
        r: 2,
        b: 55,
        t: 0,
      },
      xaxis: {
        title: 'Seconds',
        linecolor: '#d7dee3',
        zerolinecolor: '#d7dee3',
      },
      yaxis: {
        linecolor: '#d7dee3',
      },
    }, {
      displayModeBar: false
    });
  }
}
