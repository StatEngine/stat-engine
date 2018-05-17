'use strict';

import moment from 'moment';
import _ from 'lodash';

export default class ReportHistoryController {
  /*@ngInject*/
  constructor($state, savedReports) {
    this.$state = $state;

    var reports = savedReports || [];

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
