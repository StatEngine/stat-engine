'use strict';

import moment from 'moment-timezone';
let _;

export default class ReportHistoryController {
  /*@ngInject*/
  constructor($state, savedReports) {
    this.$state = $state;
    this.savedReports = savedReports;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    let reports = this.savedReports || [];

    reports.forEach(report => {
      report.timestamp = moment(report.name).valueOf();
    });

    reports = _.orderBy(reports, ['timestamp'], ['desc']);

    this.timelineReports = [];
      reports.forEach(report => {
        this.timelineReports.push({
          title: `${report.name} ${_.capitalize(report.type)}`,
          badgeClass: 'info',
          badgeIconClass: 'glyphicon-check',
          type: report.type,
          name: report.name,
          lastUpdated: report.updated_at,
          lastUpdatedBy: report.User.name,
          totalViews: _.sumBy(report.ReportMetrics, rm => rm.views),
          uniqueUsers: report.ReportMetrics.length,
        });
    });
  }

  goto(report) {
    this.$state.go('site.report.view', {
      type: report.type,
      name: report.name
    });
  }
}
