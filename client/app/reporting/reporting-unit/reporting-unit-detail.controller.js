/* eslint  class-methods-use-this: 0 */

'use strict';

import { autorun } from "mobx"
import _ from 'lodash';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { FirecaresLookup } from '@statengine/shiftly';

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
  constructor($state, currentPrincipal) {
    this.unitStore = Store.unitStore;
    this.uiStore = Store.uiStore;

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
      this.selected = this.unitStore.selected;

      this.responsesTableOptions.data = this.unitStore.responses;

      this.currentMetrics = this.unitStore.currentMetrics;
      this.previousMetrics = this.unitStore.previousMetrics;
      this.totalMetrics = this.unitStore.totalMetrics;

      this.timeFilters = this.uiStore.timeFilters;
      this.selectedTime = this.uiStore.selectedFilters.timeFilter.id;

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

  changeFilter() {
    Store.uiStore.setTimeFilter(this.selectedTime);

    Store.unitStore.fetchSelectedResponses(this.selected.id, {
      timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
      timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
    });

    Store.unitStore.fetchSelectedMetrics(this.selected.id, {
      timeStart: Store.uiStore.selectedFilters.timeFilter.filter.start,
      timeEnd: Store.uiStore.selectedFilters.timeFilter.filter.end,
    });
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
