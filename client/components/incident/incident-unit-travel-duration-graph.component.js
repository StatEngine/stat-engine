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
      x: units,
      y: expected,
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
      x: units,
      y: actual,
      name: 'Actual',
      type: 'bar',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
        }
      },
    };

    const firstDue = _.find(this.incident.apparatus, u => u.first_due);
    const firstArrived = _.find(this.incident.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);

    const firstArrivalTrace = {
      x: [units[0], units[units.length - 1]],
      y: [firstArrived.extended_data.travel_duration, firstArrived.extended_data.travel_duration],
      type: 'scatter',
      name: 'First Arrival',
      mode: 'lines',
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      }
    };

    const data = [];

    if(this.travelMatrix) data.push(expectedTrace);
    data.push(actualTrace);
    data.push(firstArrivalTrace);

    var layout = {
      barmode: 'group',
      bargap: 0.3,
      bargroupgap: 0,
      height: 290,
      margin: {
        l: 52,
        r: 1,
        b: 30,
        t: 0,
      },
      yaxis: {
        title: 'Seconds',
        zerolinecolor: '#d7dee3',
        linecolor: '#d7dee3',
      },
      xaxis: {
        // zerolinecolor: '#d7dee3',
        linecolor: '#d7dee3',
      },
      annotations: [{
        x: firstDue.unit_id,
        y: this.travelMatrix
          ? _.max([firstDue.extended_data.travel_duration, this.travelMatrix[firstDue.unit_id].duration]) + 20 : firstDue.extended_data.travel_duration,
        xref: 'x',
        yref: 'y',
        text: 'First Due',
        showarrow: false,
        font: {
          color: '#26a88e'
        },
      }]
    };
    PlotlyBasic.newPlot(this.id, data, layout, {displayModeBar: false});
  }
}
