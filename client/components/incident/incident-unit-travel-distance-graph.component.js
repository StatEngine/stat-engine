'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

export default class IncidentUnitTravelDistanceGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-travel-distance-graph';
  }

  onResize() {
    Plotly.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    angular.element(this.$window).on('resize', this.onResize);

    if(this.travelMatrix) {
      const units = _.keys(this.travelMatrix);

      const estimated = [];
      _.forEach(units, unit_id => {
        const estimatedDistance = this.travelMatrix[unit_id].distance;

        estimated.push(estimatedDistance);
      });

      const estimatedTrace = {
        x: units,
        y: estimated,
        name: 'Estimated',
        type: 'bar',
        marker: {
          color: 'rgba(55,128,191,0.6)',
          width: 1
        },
      };

      const firstDue = _.find(this.incident.apparatus, u => u.first_due);

      var data = [estimatedTrace];
      var layout = {
        title: 'Travel Distances',
        yaxis: {
          title: 'miles',
        },
        annotations: [{
          x: firstDue.unit_id,
          y: this.travelMatrix ? this.travelMatrix[firstDue.unit_id].distance : undefined,
          xref: 'x',
          yref: 'y',
          text: 'First Due',
          showarrow: true,
          arrowhead: 9,
          arrowcolor: 'black',
          font: {
            color: 'black'
          },
          ax: 30,
          ay: -30
        }]
      };
      Plotly.newPlot(this.id, data, layout);
    }
  }
}
