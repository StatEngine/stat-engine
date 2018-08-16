'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

export default class IncidentComparisonGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-comparison-graph';
  }

  onResize() {
    Plotly.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    const x = [];
    const y = [];

    _.forOwn(this.comparison, (data, key) => {
      let value = _.get(data, 'response_duration_percentile_rank.values[\'90.0\']')
      if (value) {
        x.push(key);
        y.push(value)
      }
    });

    const shapes = [];
    shapes.push({
      type: 'line',
      x0: -1,
      x1: x.length,
      y0: this.incident.description.extended_data.response_duration,
      y1: this.incident.description.extended_data.response_duration,
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
      name: this.incident.description.incident_number || 'This incident'
    });

    Plotly.newPlot(this.id, [{
      x: x,
      y: y,
      orientation: 'v',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
          width: 1
        }
      },
      type: 'bar'
    }], {
      shapes: shapes,
      annotations: [{
        x: -0.75,
        y: this.incident.description.extended_data.response_duration,
        text: this.incident.description.incident_number || 'This incident',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: '#e91276',
        font: {
          color: '#e91276'
        },
        ax: -10,
        ay: -30
      }],
      height: 290,
      margin: {
        l: 50,
        r: 2,
        b: 100,
        t: 0,
      },
      xaxis: {
        linecolor: '#d7dee3',
        zerolinecolor: '#d7dee3',
      },
      yaxis: {
        title: 'Seconds',
        linecolor: '#d7dee3',
      },
    },
    {displayModeBar: false}
  );
  }
}
