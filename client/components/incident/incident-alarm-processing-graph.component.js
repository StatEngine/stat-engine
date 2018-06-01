'use strict';

import angular from 'angular';

import Plotly from 'plotly.js'

const ID = 'incident-alarm-processing-graph';

export default class IncidentAlarmProcessingGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;

    angular.element(this.$window).on('resize', this.onResize);
  }

  onResize() {
    Plotly.Plots.resize(ID);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    // Get alarm durations
    const data = [];

    data.push({
      x: [_.get(this.incident, 'durations.alarm_processing.seconds')],
      y: ['Processing'],
      name: 'Processing',
      orientation: 'h',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar',
    });

    const shapes = [];
    shapes.push({
      type: 'line',
      x0: 64,
      x1: 64,
      y0: -1,
      y1: 1,
      xref: 'x',
      yref: 'y',
      line: {
        color: 'yellow',
        width: 4,
        dash: 'dash',
      },
    }, {
      type: 'line',
      x0: 106,
      x1: 106,
      y0: -1,
      y1: 1,
      xref: 'x',
      yref: 'y',
      line: {
        color: 'red',
        width: 4,
        dash: 'dash',
      },
    });

    const layout = {
      title: 'Alarm Processing Duration',
      barmode: 'overlay',
      shapes: shapes,
      xaxis: {
        title: 'seconds',
      },
      annotations: [{
        x: 64,
        y: 1,
        text: '64s',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: 'black',
        font: {
          color: 'black'
        },
        ax: 40,
        ay: -10
      }, {
        x: 106,
        y: 1,
        text: '106s',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: 'black',
        font: {
          color: 'black'
        },
        ax: 40,
        ay: -10
      }]
    };

    Plotly.newPlot(ID, data, layout);
  }
}
