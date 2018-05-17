'use strict';

export default class ReportHistoryController {
  /*@ngInject*/
  constructor($state, reports) {
    this.$state = $state;

    this.reports = reports || [];
    console.dir(this.reports);

    this.timelineReports = [];
    this.reports.forEach((report) => {
      this.timelineReports.push({
        title: report.name,
        badgeClass: 'info',
        badgeIconClass: 'glyphicon-check',
        type: report.type,
        name: report.name,
      })
    });
  }

  goto(report) {

    console.dir(report)
    this.$state.go('site.report.view', {
      type: report.type,
      name: report.name
    });
  }
}
