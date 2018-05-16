'use strict';

import _ from 'lodash';
import moment from 'moment';

export default class MOTDHistoryController {
  /*@ngInject*/
  constructor($state) {
    this.$state = $state;
    this.now = moment();

    this.lastYear = moment(this.now).subtract(1, 'year');

    this.reports = []
    for (var m = moment(this.now); m.isAfter(this.lastYear); m.subtract('days', 1)) {
      this.reports.push({
        title: m.format('YYYY-MM-DD'),
        badgeClass: 'info',
        badgeIconClass: 'glyphicon-check',
      })
    }
  }

  goto(report) {
    const reportDate = moment(report.title);

    this.$state.go('site.motd.day', {
      year: reportDate.year(),
      month: reportDate.month()+1,
      date: reportDate.date()
    });
  }
}
