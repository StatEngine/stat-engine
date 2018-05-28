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
    const alarmProcessingData = [];
    const alarmAnsweringDurations = {
      x: [_.get(this.incident, 'durations.alarm_answer.seconds')],
      y: ['PSAP'],
    };
    const alarmHandlingDurations = {
      x: [_.get(this.incident, 'durations.alarm_handling.seconds')],
      y: ['PSAP'],
    };

    alarmProcessingData.push({
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
    alarmProcessingData.push({
      x: alarmHandlingDurations.x,
      y: alarmHandlingDurations.y,
      name: 'Handling',
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
      title: 'Alarm Processing Durations',
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

    Plotly.newPlot(ID, alarmProcessingData, layout);
  }
}
