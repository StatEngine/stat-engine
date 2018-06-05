'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js';

export default class IncidentAlarmAnsweringGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-alarm-answering-graph';
  }

  onResize() {
    Plotly.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    angular.element(this.$window).on('resize', this.onResize);

    // Get alarm durations
    const data = [];

    data.push({
      x: [_.get(this.incident, 'durations.alarm_answer.seconds')],
      y: ['Answering'],
      name: 'Answering',
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
      x0: 15,
      x1: 15,
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
      x0: 40,
      x1: 40,
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
      title: 'Alarm Answering Duration',
      barmode: 'overlay',
      shapes,
      xaxis: {
        title: 'seconds',
      },
      annotations: [{
        x: 15,
        y: 1,
        text: '15s',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: 'black',
        font: {
          color: 'black'
        },
        ax: 40,
        ay: -10
      }, {
        x: 40,
        y: 1,
        text: '40s',
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

    Plotly.newPlot(this.id, data, layout);
  }
}
