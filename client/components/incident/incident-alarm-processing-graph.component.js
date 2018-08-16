'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

export default class IncidentAlarmProcessingGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-alarm-processing-graph';
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
      x: [_.get(this.incident, 'durations.alarm_processing.seconds')],
      y: ['Processing'],
      name: 'Processing',
      orientation: 'h',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
          width: 1
        }
      },
      type: 'bar',
      text: [_.get(this.incident, 'durations.alarm_processing.seconds')],
      textposition: 'outside',
      outsidetextfont: {
        color: '#44a0c1',
        family: 'Open Sans',
        size: 30
      },
      hoverinfo: 'none',
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
        color: '#ed8c5a',
        width: 3,
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
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
    });

    const layout = {
      barmode: 'overlay',
      shapes: shapes,
      height: 290,
      margin: {
        l: 5,
        r: 5,
        b: 55,
        t: 3,
        pad: 4
      },
      xaxis: {
        title: 'Seconds',
        linecolor: '#d7dee3',
        zerolinecolor: '#d7dee3',
      },
      yaxis: {
         autorange: true,
         showgrid: false,
         zeroline: false,
         showline: false,
         autotick: true,
         ticks: '',
         showticklabels: false
      },
      annotations: [{
        x: 64,
        y: 1.1,
        text: '64s',
        showarrow: false,
        font: {
          color: '#ed8c5a',
        },
      }, {
        x: 106,
        y: 1.1,
        text: '106s',
        showarrow: false,
        font: {
          color: '#e91276'
        },
      }]
    };

    Plotly.newPlot(ID, data, layout, {displayModeBar: false});
  }
}
