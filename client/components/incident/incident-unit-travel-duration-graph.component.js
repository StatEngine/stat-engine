'use strict';

import angular from 'angular';

import _ from 'lodash';
import Plotly from 'plotly.js/dist/plotly-basic.js';

export default class IncidentUnitTravelDurationGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-travel-duration-graph';
  }

  onResize() {
    Plotly.Plots.resize(this.id);
  }

  $onDestroy() {
    angular.element(this.$window).off('resize', this.onResize);
  }

  $onInit() {
    angular.element(this.$window).on('resize', this.onResize);

    const expected = [];
    const actual = [];

    let units = [];
    _.forEach(this.incident.apparatus, u => {
      units.push(u.unit_id);
      const actualDuration = _.get(u, 'extended_data.travel_duration');
      actual.push(actualDuration);

      const expectedDuration = _.get(this.travelMatrix, `${u.unit_id}.duration`);
      if(expectedDuration) expected.push(expectedDuration);
    });

    const expectedTrace = {
      x: units,
      y: expected,
      name: 'Expected',
      type: 'bar',
      opacity: 0.5,
    };

    const actualTrace = {
      x: units,
      y: actual,
      name: 'Actual',
      type: 'bar',
      opacity: 0.5,
    };

    const firstDue = _.find(this.incident.apparatus, u => u.first_due);
    const firstArrived = _.find(this.incident.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);

    let shapes = [];
    let annotations = [];

    if(firstDue) {
      annotations.push({
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
      });
    }
    if(firstArrived) {
      shapes.push({
        type: 'line',
        x0: -1,
        x1: units.length,
        y0: firstArrived.extended_data.travel_duration,
        y1: firstArrived.extended_data.travel_duration,
        line: {
          color: 'red',
          width: 4,
          dash: 'dash',
        },
        name: 'Suggested'
      });
      annotations.push({
        x: -0.75,
        y: firstArrived.extended_data.travel_duration,
        text: this.incident.description.incident_number || 'This Incident',
        showarrow: true,
        arrowhead: 9,
        arrowcolor: 'black',
        font: {
          color: 'black'
        },
        ax: -10,
        ay: -30
      });
    }
    var data = [expectedTrace, actualTrace];
    var layout = {
      title: 'Travel Durations',
      barmode: 'overlay',
      yaxis: {
        title: 'seconds',
      },
      shapes,
      annotations,
    };
    Plotly.newPlot(this.id, data, layout);
  }
}
