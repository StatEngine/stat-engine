'use strict';

import angular from 'angular';

let _;


export default class IncidentCategoryChartComponent {
  constructor() {
    'ngInject';

    this.initialized = false;
    console.dir('new')
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.trace = [];

    let categories = [];

    _.forEach(this.data, d => {
      _.forOwn(d.group_by_data.category, (stats, categoryName) => {
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
      _.forEach(this.data, d => {
        let count = _.get(d.group_by_data.category[categoryName], 'count');
        if (!_.isNil(count)) {
          curTrace.x.push(d.id);
          curTrace.y.push(count);
        }
      });
      this.trace.push(curTrace);
    });

    this.layout = { barmode: 'stack' };

    this.initialized = true;
  }
}
