'use strict';

let _;
let PlotlyBasic;

export default class IncidentUnitResponseGraphComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
    this.id = 'incident-unit-response-graph';
  }

  async loadModules() {
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    // Get turnout and travel durations
    const unitTimelineData = [];
    const turnoutDurations = {
      x: [],
      y: [],
    };
    const travelDurations = {
      x: [],
      y: [],
    };

    _.forEach(this.incident.apparatus, u => {
      if(_.get(u, 'extended_data.turnout_duration')) {
        turnoutDurations.x.push(u.extended_data.turnout_duration);
        turnoutDurations.y.push(u.unit_id);
      }
      if(_.get(u, 'extended_data.travel_duration')) {
        travelDurations.x.push(u.extended_data.travel_duration);
        travelDurations.y.push(u.unit_id);
      }
    });

    unitTimelineData.push({
      x: turnoutDurations.x,
      y: turnoutDurations.y,
      name: 'Turnout',
      orientation: 'h',
      marker: {
        color: '#44a0c1',
        line: {
          color: '#005364',
          width: 1
        }
      },
      type: 'bar'
    });
    unitTimelineData.push({
      x: travelDurations.x,
      y: travelDurations.y,
      name: 'Travel',
      orientation: 'h',
      marker: {
        color: '#3eceb0',
        line: {
          color: '#25a88e',
          width: 1
        }
      },
      type: 'bar'
    });

    // Add red line for threshold time
    const shapes = [];

    let threshold = 60;
    if(this.incident.description.category === 'FIRE') threshold = 80;

    shapes.push({
      type: 'line',
      x0: threshold,
      x1: threshold,
      y0: -1,
      y1: turnoutDurations.x.length,
      line: {
        color: '#e91276',
        width: 3,
        dash: 'dash',
      },
      name: 'Suggested'
    });

    const layout = {
      barmode: 'stack',
      shapes,
      height: 320,
      margin: {
        l: 55,
        r: 5,
        b: 55,
        t: 10,
        pad: 4
      },
      xaxis: {
        title: 'Seconds',
        linecolor: '#d7dee3',
        zerolinecolor: '#d7dee3',
      },
      legend: {
        orientation: 'h',
        xanchor: 'center',
        yanchor: 'bottom',
        x: 0.5,
        y: 1.05,
      },
      annotations: [{
        x: threshold,
        y: turnoutDurations.x.length + .2,
        text: `${threshold}s`,
        showarrow: false,
        font: {
          color: '#e91276'
        },
      }]
    };

    PlotlyBasic.newPlot(this.id, unitTimelineData, layout, {
      displayModeBar: false,
      responsive: true,
    });
  }
}
