'use strict';

import angular from 'angular';

import Plotly from 'plotly.js'

const ID = 'incident-comparison-graph';

export default class IncidentComparisonGraphComponent {
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
        color: 'red',
        width: 4,
        dash: 'dash',
      },
      name: this.incident.description.incident_number || 'This incident'
    });


    Plotly.newPlot(ID, [{
      x: x,
      y: y,
      orientation: 'v',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    }], {
      title: 'Response Time Comparisons<br><span style="font-size: 14px">Dispatch to the first arriving unit.</span>',
      shapes: shapes,
      annotations: [{
        x: -0.75,
        y: this.incident.description.extended_data.response_duration,
        text: this.incident.description.incident_number || 'This incident',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: 'black',
        font: {
          color: 'black'
        },
        ax: -10,
        ay: -30
      }],
      yaxis: {
        title: '90th Percentile Response Time (sec)'
      }
    });
  }
}
