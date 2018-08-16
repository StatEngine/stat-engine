'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

export default class IncidentUnitResponseGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-response-graph';
  }

  onResize() {
    Plotly.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    angular.element(this.$window).on('resize', this.onResize);

    // Get turnout and travel durations
    const unitTimelineData = [];
    const turnoutDurations = {
      x: [],
      y: [],
    };
    const travelDurations = {
      x: [],
      y: [],
    };

    _.forEach(this.incident.apparatus, u => {
      if (u.extended_data.turnout_duration) {
        turnoutDurations.x.push(u.extended_data.turnout_duration);
        turnoutDurations.y.push(u.unit_id);
      }
      if (u.extended_data.travel_duration) {
        travelDurations.x.push(u.extended_data.travel_duration);
        travelDurations.y.push(u.unit_id);
      }
    });

    unitTimelineData.push({
      x: turnoutDurations.x,
      y: turnoutDurations.y,
      name: 'Turnout',
      orientation: 'h',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
          width: 1
        }
      },
      type: 'bar'
    });
    unitTimelineData.push({
      x: travelDurations.x,
      y: travelDurations.y,
      name: 'Travel',
      orientation: 'h',
      marker: {
        color: '#3eceb0',
        line: {
          color: '#25a88e',
          width: 1
        }
      },
      type: 'bar'
    });

    // Add red line for threshold time
    const shapes = [];

    let threshold = 60;
    if (this.incident.description.category === 'FIRE') threshold = 80;

    shapes.push({
      type: 'line',
      x0: threshold,
      x1: threshold,
      y0: -1,
      y1: this.incident.apparatus.length,
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
      name: 'Suggested'
    });

    const layout = {
      barmode: 'stack',
      shapes: shapes,
      height: 290,
      margin: {
        l: 55,
        r: 5,
        b: 55,
        t: 10,
        pad: 4
      },
      xaxis: {
        title: 'Seconds',
        linecolor: '#d7dee3',
        zerolinecolor: '#d7dee3',
      },
      annotations: [{
        x: threshold,
        y: this.incident.apparatus.length + .5,
        text: threshold + 's',
        showarrow: false,
        font: {
          color: '#e91276'
        },
      }]
    };

    Plotly.newPlot(ID, unitTimelineData, layout, {displayModeBar: false});
  }
}
