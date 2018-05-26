'use strict';

import angular from 'angular';

import _ from 'lodash';

import Plotly from 'plotly.js'

const ID = 'incident-unit-travel-duration-graph';

export default class IncidentUnitTravelDurationGraphComponent {
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
    const actualOver = [];
    const actualUnder = [];

    const expected = [];

    _.forEach(units, unit_id => {
      let actualUnit = _.find(this.incident.apparatus, u => u.unit_id === unit_id);
      if (!actualUnit) throw new Error('Could not find unit in apparatus data');

      const actualDuration = _.get(actualUnit, 'extended_data.travel_duration');
      const expectedDuration = this.travelMatrix[unit_id].duration;

      if (actualDuration && actualDuration > expectedDuration) {
        actualOver.push(actualDuration);
        actualUnder.push(null);
      }
      if (actualDuration && actualDuration <= expectedDuration) {
        actualOver.push(null);
        actualUnder.push(actualDuration);
      }

      expected.push(expectedDuration);
    })

    const expectedTrace = {
      x: units,
      y: expected,
      name: 'Expected',
      type: 'bar',
      opacity: 0.5,
      width: [.1, .1, .1],
    };

    const actualOverTrace = {
      x: units,
      y: actualOver,
      name: 'Slower Than Expected',
      type: 'bar',
      opacity: 0.5,
      width: [.2, .2, .2],
      marker: {
        color: new Array(units.length).fill('red')
      }
    };

    const actualUnderTrace = {
      x: units,
      y: actualUnder,
      name: 'Faster Than Expected',
      type: 'bar',
      opacity: 0.5,
      width: [.2, .2, .2],
      marker: {
        color: new Array(units.length).fill('green')
      }
    };

    const firstDue = _.find(this.incident.apparatus, u => u.first_due);
    const firstArrived = _.find(this.incident.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);
    console.dir(firstArrived);

    var data = [expectedTrace, actualOverTrace, actualUnderTrace];
    var layout = {
      title: 'Travel Durations',
      barmode: 'overlay',
      yaxis: {
        title: 'seconds',
      },
      shapes: [{
        type: 'line',
        x0: units[0],
        x1: units[units.length-1],
        y0: firstArrived.extended_data.travel_duration,
        y1: firstArrived.extended_data.travel_duration,
        line: {
          color: 'black',
          width: 2,
          dash: 'dash'
        },
        name: 'Suggested'
      }],
      annotations: [{
        x: firstDue.unit_id,
        y: firstDue.extended_data.travel_duration,
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
    Plotly.newPlot(ID, data, layout);
  }
}
