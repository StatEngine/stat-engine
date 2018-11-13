'use strict';

import angular from 'angular';

let _;
let PlotlyBasic;

export default class IncidentUnitTravelDurationGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-travel-duration-graph';
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

    angular.element(this.$window).on('resize', this.onResize);

    const expected = [];
    const actual = [];

    const units = [];

    _.forEach(this.incident.apparatus, u => {
      let unitId = u.unit_id;
      units.push(unitId);

      const actualDuration = _.get(u, 'extended_data.travel_duration');
      actual.push(actualDuration);

      if(this.travelMatrix) {
        const expectedDuration = this.travelMatrix[unitId].duration;
        expected.push(expectedDuration);
      }
    });

    const expectedTrace = {
      y: units,
      x: expected,
      orientation: 'h',
      name: 'Expected',
      type: 'bar',
      marker: {
        color: '#3eceb0',
        line: {
          color: '#25a88e',
        }
      },
    };

    const actualTrace = {
      y: units,
      x: actual,
      orientation: 'h',
      name: 'Actual',
      type: 'bar',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
        }
      },
    };

    const firstArrived = _.find(this.incident.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);

    let shapes = [];
    let annotations = [];

    if(firstArrived) {
      shapes.push({
        type: 'line',
        x0: firstArrived.extended_data.travel_duration,
        x1: firstArrived.extended_data.travel_duration,
        y0: -1,
        y1: units.length,
        line: {
          color: '#e91276',
          width: 3,
          dash: 'dash',
        },
        name: 'First Arrival'
      });

      annotations.push({
        x: firstArrived.extended_data.travel_duration,
        y: units.length + 0.2,
        text: 'First Arrival',
        showarrow: false,
        font: {
          color: '#e91276'
        },
      });
    }

    const data = [];

    if(this.travelMatrix) data.push(expectedTrace);
    data.push(actualTrace);

    var layout = {
      height: 290,
      shapes,
      annotations,
      margin: {
        l: 52,
        r: 1,
        b: 30,
        t: 0,
      },
      yaxis: {
        zerolinecolor: '#d7dee3',
        linecolor: '#d7dee3',
      },
      xaxis: {
        // zerolinecolor: '#d7dee3',
        title: 'Seconds',
        linecolor: '#d7dee3',
      },

    };
    PlotlyBasic.newPlot(this.id, data, layout, {displayModeBar: false});
  }
}
