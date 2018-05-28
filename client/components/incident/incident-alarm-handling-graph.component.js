'use strict';

import angular from 'angular';

import Plotly from 'plotly.js'

const ID = 'incident-alarm-handling-graph';

export default class IncidentAlarmHandlingGraphComponent {
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
    const alarmHandlingData = [];
    const alarmAnsweringDurations = {
      x: [_.get(this.incident, 'durations.alarm_answer.seconds')],
      y: ['Alarm'],
    };
    const alarmProcessingDurations = {
      x: [_.get(this.incident, 'durations.alarm_processing.seconds')],
      y: ['Alarm'],
    };

    alarmHandlingData.push({
      x: alarmAnsweringDurations.x,
      y: alarmAnsweringDurations.y,
      name: 'Answer',
      orientation: 'h',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    });
    alarmHandlingData.push({
      x: alarmProcessingDurations.x,
      y: alarmProcessingDurations.y,
      name: 'Processing',
      orientation: 'h',
      marker: {
        color: 'rgba(255,153,51,0.6)',
        width: 1
      },
      type: 'bar'
    });

    // Add red line for threshold time
    const shapes = [];

    let threshold = 60;

    shapes.push({
      type: 'line',
      x0: threshold,
      x1: threshold,
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
      title: 'Alarm Handling Durations',
      barmode: 'stack',
      shapes: shapes,
      xaxis: {
        title: 'seconds',
      },
      annotations: [{
        x: 60,
        y: 1,
        text: threshold + 's',
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

    Plotly.newPlot(ID, alarmHandlingData, layout);
  }
}
