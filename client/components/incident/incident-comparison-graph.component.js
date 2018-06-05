'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-cartesian.js';

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
    angular.element(this.$window).on('resize', this.onResize);
    const x = [];
    const y = [];
    const text = [];

    _.sortBy(_.toPairs(this.comparison), comp => comp[0]).forEach(comp => {
      let [key, data] = comp;
      let value = _.get(data, 'response_duration_percentile_rank.values[\'90.0\']');
      if(value) {
        x.push(key);
        y.push(value);
        text.push(`Total incidents: <b>${data.doc_count}</b>`);
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


    Plotly.newPlot(this.id, [{
      x,
      y,
      text,
      orientation: 'v',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    }], {
      title: 'Response Time Comparisons<br><span style="font-size: 14px">Dispatch to the first arriving unit.</span>',
      shapes,
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
