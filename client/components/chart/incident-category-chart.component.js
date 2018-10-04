'use strict';

import angular from 'angular';

let _;


export default class IncidentCategoryChartComponent {
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

    _.forOwn(this.data, (dateData, dateName)  => {
      _.forOwn(dateData, (categoryData, categoryName) => {
        categories.push(categoryName);
      })
    });
    categories = _.uniq(categories);

    _.forEach(categories, categoryName => {
      const curTrace = {
        name: categoryName.toUpperCase(),
        type: 'bar',
        x: [],
        y: [],
      }
      _.forOwn(this.data, (dateData, dateName) => {
        let count = _.get(dateData[categoryName], 'total_count');
        if (!_.isNil(count)) {
          curTrace.x.push(dateName);
          curTrace.y.push(count);
        }
      });
      this.trace.push(curTrace);
    });

    this.layout = {
      barmode: 'stack'
    };

    this.initialized = true;
  }
}
