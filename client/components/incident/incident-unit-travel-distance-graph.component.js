'use strict';

import angular from 'angular';

let _;
let PlotlyBasic;

export default class IncidentUnitTravelDistanceGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-travel-distance-graph';
  }

  async loadModules() {
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  onResize() {
    PlotlyBasic.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  async $onInit() {
    await this.loadModules();

    if(this.travelMatrix) {
      const units = _.keys(this.travelMatrix);

      const estimated = [];

      _.forEach(units, unit_id => {
        const estimatedDistance = this.travelMatrix[unit_id].distance;
        estimated.push(estimatedDistance);
      });

      // '#3eceb0','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1','#44a0c1']
      // ['#25a88e','#005364','#005364','#005364','#005364','#005364','#005364','#005364','#005364'],
      const estimatedTrace = {
        x: units,
        y: estimated,
        name: 'Estimated',
        type: 'bar',
        marker: {
          color: _.fill(Array(units.length), '#44a0c1'),
          line: {
            color: _.fill(Array(units.length), '#005364'),
            width: 1
          }
        },
      };

      const annotations = [];
      const firstDueIndex = _.findIndex(this.incident.apparatus, u => u.first_due);
      if(firstDueIndex > -1) {
        let unitId = this.incident.apparatus[firstDueIndex].unit_id;
        estimatedTrace.marker.color[firstDueIndex] = '#3eceb0';
        estimatedTrace.marker.line.color[firstDueIndex] = '#25a88e';
        annotations.push({
          x: unitId,
          y: this.travelMatrix[unitId].distance + 0.2,
          xref: 'x',
          yref: 'y',
          text: 'First Due',
          showarrow: false,
          font: {
            color: '#26a88e'
          },
        });
      }

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
        annotations,
      };
      PlotlyBasic.newPlot(this.id, data, layout, {displayModeBar: false});
    }
  }
}
