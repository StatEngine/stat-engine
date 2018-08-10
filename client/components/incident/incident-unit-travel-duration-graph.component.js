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

    const expected = [];
    const actual = [];

    _.forEach(units, unit_id => {
      let actualUnit = _.find(this.incident.apparatus, u => u.unit_id === unit_id);
      if (!actualUnit) throw new Error('Could not find unit in apparatus data');

      const actualDuration = _.get(actualUnit, 'extended_data.travel_duration');
      const expectedDuration = this.travelMatrix[unit_id].duration;

      actual.push(actualDuration);
      expected.push(expectedDuration);
    })

    const expectedTrace = {
      x: units,
      y: expected,
      name: 'Expected',
      type: 'bar',
      marker: {
        color: '#3eceb0',
        line: {
          color: '#25a88e',
          width: 1
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
          width: 1
        }
      },
    };

    const firstDue = _.find(this.incident.apparatus, u => u.first_due);
    const firstArrived = _.find(this.incident.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);

    var data = [expectedTrace, actualTrace];
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
      shapes: [{
        type: 'line',
        x0: -1,
        x1: units.length,
        y0: firstArrived.extended_data.travel_duration,
        y1: firstArrived.extended_data.travel_duration,
        line: {
          color: '#e91276',
          width: 3,
          dash: 'dash',
        },
        name: 'Suggested'
      }],
      annotations: [{
        x: firstDue.unit_id,
        y: firstDue.extended_data.travel_duration,
        xref: 'x',
        yref: 'y',
        text: 'First Due',
        showarrow: false,
        font: {
          color: '#26a88e'
        },

      // TODO: CAN WE MOVE THIS INFO INTO THE LEGEND AS OPPOSED TO IT BEING AN ANNOTATION?

      // }, {
      //   x: 0.15,
      //   y: firstArrived.extended_data.travel_duration,
      //   text: (this.incident.description.incident_number || 'This Incident') + ' First Arrival',
      //   showarrow: true,
      //   arrowhead: 9,
      //   arrowcolor: '#e91276',
      //   font: {
      //     color: '#e91276'
      //   },
      //   ax: 0,
      //   ay: -130
      }]
    };
    Plotly.newPlot(ID, data, layout, {displayModeBar: false});
  }
}
