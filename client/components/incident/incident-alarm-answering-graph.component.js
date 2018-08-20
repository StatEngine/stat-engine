'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

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

    const alarmAnswer = _.get(this.incident, 'durations.alarm_answer.seconds');
    const warningThreshold = 15;
    const dangerThreshold = 40;

    data.push({
      x: [alarmAnswer],
      y: [1],
      orientation: 'h',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
          width: 1
        }
      },
      type: 'bar',
      text: [_.get(this.incident, 'durations.alarm_answer.seconds')],
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
      x0: warningThreshold,
      x1: warningThreshold,
      y0: 0,
      y1: 2,
      xref: 'x',
      yref: 'y',
      line: {
        color: '#ed8c5a',
        width: 3,
        dash: 'dash',
      },
    }, {
      type: 'line',
      x0: dangerThreshold,
      x1: dangerThreshold,
      y0: 0,
      y1: 2,
      xref: 'x',
      yref: 'y',
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
    });

    let xMax = _.max([dangerThreshold, alarmAnswer]) + 5;

    const layout = {
      barmode: 'overlay',
      shapes,
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
        range: [0, xMax]
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
        x: warningThreshold,
        y: 2.1,
        text: '15s',
        showarrow: false,
        font: {
          color: '#ed8c5a',
        },
      }, {
        x: dangerThreshold,
        y: 2.1,
        text: '40s',
        showarrow: false,
        font: {
          color: '#e91276'
        },
      }]
    };

    Plotly.newPlot(this.id, data, layout, {displayModeBar: false});
  }
}
