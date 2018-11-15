'use strict';

let _;

export default class IncidentFirstDueTravelDurationChartComponent {
  constructor() {
    'ngInject';

    this.initialized = false;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.trace = [];

    let firstDueTrace = {
      x: [],
      y: [],
      name: 'First Due',
      type: 'bar',
    };

    let nonFirstDueTrace = {
      x: [],
      y: [],
      name: 'Non First Due',
      type: 'bar',
    };

    _.forEach(this.data, d => {
      firstDueTrace.x.push(d.id);
      firstDueTrace.y.push(d.id_data.first_due_travel);
      nonFirstDueTrace.x.push(d.id);
      nonFirstDueTrace.y.push(d.id_data.non_first_due_travel);
    });

    this.trace.push(firstDueTrace);
    this.trace.push(nonFirstDueTrace);

    console.dir(this.trace)
    this.layout = {
      barmode: 'group'
    };

    this.initialized = true;
  }
}
