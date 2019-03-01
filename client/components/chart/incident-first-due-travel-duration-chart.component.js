'use strict';

let _;

export default class IncidentFirstDueTravelDurationChartComponent {
  initialized = false;

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.layout = {
      barmode: 'group'
    };

    this.updatePlot();

    this.initialized = true;
  }

  $onChanges() {
    if(!this.initialized) {
      return;
    }

    this.updatePlot();
  }

  updatePlot() {
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

    this.trace = [firstDueTrace, nonFirstDueTrace];
  }
}
