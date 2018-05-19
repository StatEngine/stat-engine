'use strict';

import moment from 'moment';

export default class ReportsViewController {
  /*@ngInject*/
  constructor($state, $stateParams, SegmentService, currentPrincipal, report, reportViews) {
    this.$state = $state;
    this.$stateParams = $stateParams;

    this.SegmentService = SegmentService;
    this.FireDepartment = currentPrincipal.FireDepartment;
    this.timezone = this.FireDepartment.timezone;
    this.report = report;
    this.reportViews = reportViews;

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

  edit() {
    this.$state.go('site.report.edit', {
      type: this.$stateParams.type,
      name: this.$stateParams.name
    });
  }

  pageBack() {
    const dest = moment(this.$stateParams.name, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    this.$state.go('site.report.view', {
      type: this.$stateParams.type,
      name: dest
    });
  }

  pageForward() {
    const dest = moment(this.$stateParams.name, 'YYYY-MM-DD')
      .add(1, 'day')
      .format('YYYY-MM-DD');
    this.$state.go('site.report.view', {
      type: this.$stateParams.type,
      name: dest
    });
  }
}
