'use strict';

import moment from 'moment-timezone';

let _;

const COLORS = {
  FIRE: '#f3786b',
  EMS: '#5fb5c8',
  OTHER: '#f8b700'
};

export default class IncidentCategoryChartComponent {
  initialized = false;

  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.layout = {
      barmode: 'stack',
      xaxis: {
        title: 'Datetime',
      },
      yaxis: {
        title: 'Responses',
      },
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
        let count = _.get(dateData[categoryName], 'total_count');
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
