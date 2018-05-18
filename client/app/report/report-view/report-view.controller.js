'use strict';

export default class ReportsViewController {
  /*@ngInject*/
  constructor($state, SegmentService, currentPrincipal, report, reportViews) {
    this.$state = $state;
    this.SegmentService = SegmentService;
    this.FireDepartment = currentPrincipal.FireDepartment;
    this.timezone = this.FireDepartment.timezone;
    this.report = report;
    this.reportViews = reportViews;

    console.dir(report);
    console.dir(reportViews)

    if(this.report) {
      this.incidentTableOptions = {
        data: this.report.content.stats.incident.stats,
        columnDefs: [{
          field: 'name',
        }, {
          field: 'value',
          cellFilter: 'number: 0',
        }]
      };

      this.unitTableOptions = {
        data: this.report.content.stats.unit.stats,
        columnDefs: [{
          field: 'name',
        }, {
          field: 'totalCount',
          cellFilter: 'number: 0',
          displayName: 'Incidents'
        }, {
          field: 'utilization',
          displayName: 'Utilization (min)',
          cellFilter: 'number: 2',
        }, {
          field: 'distance',
          cellFilter: 'number: 2',
          displayName: 'Total Distance (m)'
        }, {
          field: 'turnoutDuration90',
          cellFilter: 'number: 2',
          displayName: '90% Turnout Duration (s)'
        }]
      };
    }
  }

  edit(report) {
    this.$state.go('site.report.edit', {
      type: report.type,
      name: report.name
    });
  }
}
