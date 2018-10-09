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

    this.responsesTableOptions = {
      data: [],
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>',
      }, {
        field: 'address.address_line1',
        displayName: 'Address'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'durations.total_event.seconds',
        displayName: 'Event Duration',
        cellFilter: 'humanizeDuration',
      }, {
        field: 'description.category',
        displayName: 'Category',
        width: 100,
      }, {
        field: 'description.type',
        displayName: 'Type',
      }]
    };

    autorun(() => {
      this.selected = this.store.selected;

      this.responsesTableOptions.data = this.store.responses;

      this.currentMetrics = this.store.currentMetrics;
      this.previousMetrics = this.store.previousMetrics;
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
