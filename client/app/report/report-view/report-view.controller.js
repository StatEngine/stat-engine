'use strict';

import _ from 'lodash';

export default class ReportsViewController {
  /*@ngInject*/
  constructor($state, SegmentService, currentPrincipal, report) {
    this.$state = $state;
    this.SegmentService = SegmentService;
    this.FireDepartment = currentPrincipal.FireDepartment;
    this.report = report;
  }

  edit(report) {
    this.$state.go('site.report.edit', {
      type: report.type,
      name: report.name
    });
  }
}
