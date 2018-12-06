'use strict';

import moment from 'moment-timezone';

let _;


const COLORS = {
  FIRE: '#f3786b',
  EMS: '#5fb5c8',
  OTHER: '#f8b700'
};
export default class IncidentTravelCategoryChartComponent {
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
        let count = _.get(dateData[categoryName], '90_percentile_travel_duration_seconds');
        curTrace.x.push(moment(dateName)
          .tz(this.tz)
          .format());
        curTrace.y.push(count);
      });
      this.trace.push(curTrace);
    });

    this.layout = {
      barmode: 'stack',
      xaxis: {
        title: 'Datetime',
      },
      yaxis: {
        title: 'Travel Time (s)',
      },
    };

    this.initialized = true;
  }
}
