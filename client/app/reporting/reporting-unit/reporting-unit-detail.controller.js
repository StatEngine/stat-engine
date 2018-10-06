/* eslint  class-methods-use-this: 0 */

'use strict';

import { autorun } from "mobx"
import _ from 'lodash';
import humanizeDuration from 'humanize-duration';

import { Store } from '../../../state/store';

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
});

export default class ReportingUnitDetailController {
  /*@ngInject*/
  constructor($state) {
    this.store = Store.unitStore;
    this.$state = $state;

    autorun(() => {
      this.selected = this.store.selected;
      this.currentMetrics = this.store.currentMetrics;
      this.totalMetrics = this.store.totalMetrics;

      // abstract this to component do this server side
      if (this.totalMetrics) {
        let arr = _.values(this.totalMetrics.time_series_data.total_data);
        arr = _.filter(arr, a => !_.isEmpty(a));
        this.totalIncidentMin = _.minBy(arr, 'total_count');
        this.totalIncidentAvg = _.meanBy(arr, 'total_count');
        this.totalIncidentMax = _.maxBy(arr, 'total_count');
      }
    })
  }

  $onDestory() {
    console.dir('reminder: destroy autorunner')
  }

  selectUnit(selected) {
    this.$state.go('site.reporting.unit.detail', { id: selected.id });
  }

  humanizeDuration(ms) {
    return shortEnglishHumanizer(ms, { round: true });
  }
}
