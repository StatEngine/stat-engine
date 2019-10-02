'use strict';

import moment from 'moment-timezone';

let _;

const COLORS = {
  FIRE: '#f3786b',
  EMS: '#5fb5c8',
  OTHER: '#f8b700'
};

export default class IncidentTurnoutCategoryChartComponent {
  constructor() {
    'ngInject';

    this.initialized = false;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  $onInit() {
    this.updatePlot();

    this.layout = {
      barmode: 'group',
      xaxis: {
        title: 'Datetime',
      },
      yaxis: {
        title: 'Turnout Time (s)',
      },
    };

    this.initialized = true;
  }

  $onChanges() {
    this.updatePlot();
  }

  async updatePlot() {
    await this.loadModules();

    const trace = [];

    let categories = [];

    _.forOwn(this.data, dateData => {
      _.forOwn(dateData, (categoryData, categoryName) => {
        categories.push(categoryName);
      });
    });
    categories = _.uniq(categories);

    _.forEach(categories, categoryName => {
      const curTrace = {
        name: categoryName.toUpperCase(),
        type: 'bar',
        x: [],
        y: [],
        marker: {
          color: COLORS[categoryName],
        }
      };
      _.forOwn(this.data, (dateData, dateName) => {
        let count = _.get(dateData[categoryName], '90_percentile_turnout_duration_seconds');
        curTrace.x.push(moment(dateName)
          .tz(this.tz)
          .format());
        curTrace.y.push(count);
      });
      trace.push(curTrace);
    });

    this.trace = trace;
  }
}
