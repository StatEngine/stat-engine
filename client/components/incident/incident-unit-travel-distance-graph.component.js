'use strict';

import angular from 'angular';

import _ from 'lodash';

import Plotly from 'plotly.js'

const ID = 'incident-unit-travel-distance-graph';

export default class IncidentUnitTravelDistanceGraphComponent {
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
    const units = _.keys(this.travelMatrix);

    const estimated = [];

    _.forEach(units, unit_id => {
      const estimatedDistance = this.travelMatrix[unit_id].distance;

      estimated.push(estimatedDistance);
    })

    const estimatedTrace = {
      x: units,
      y: estimated,
      name: 'Estimated',
      type: 'bar',
      // TODO: THERE HAS TO BE A BETTER WAY TO HAVE A UNIQUE COLOR BAR FOR FIRST DUE
      marker: {
        color: ['#3eceb0','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1'],
        line: {
          color: ['#25a88e','#005364','#005364','#005364','#005364','#005364','#005364','#005364','#005364'],
          width: 1
        }
      },
    };

    const firstDue = _.find(this.incident.apparatus, u => u.first_due);

    var data = [estimatedTrace];
    var layout = {
      height: 290,
      margin: {
        l: 40,
        r: 1,
        b: 30,
        t: 0,
      },
      yaxis: {
        title: 'Miles',
        linecolor: '#d7dee3',
      },
      xaxis: {
        linecolor: '#d7dee3',
      },
      annotations: [{
        x: firstDue.unit_id,
        y: this.travelMatrix[firstDue.unit_id].distance + 0.2,
        xref: 'x',
        yref: 'y',
        text: 'First Due',
        showarrow: false,
        font: {
          color: '#26a88e'
        },
      }]
    };
    Plotly.newPlot(ID, data, layout, {displayModeBar: false});
  }
}
