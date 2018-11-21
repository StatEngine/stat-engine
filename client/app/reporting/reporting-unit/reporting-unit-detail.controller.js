/* eslint  class-methods-use-this: 0 */

'use strict';

import { autorun } from 'mobx';
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
  constructor($state, currentPrincipal, $scope) {
    this.unitStore = Store.unitStore;
    this.uiStore = Store.uiStore;
    this.timeZone = currentPrincipal.FireDepartment.timezone;

    this.$state = $state;

    this.responsesTableOptions = {
      data: [],
      paginationPageSizes: [100],
      paginationPageSize: 100,
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>',
      }, {
        field: 'address.address_line1',
        displayName: 'Address'
      }, {
        field: 'description.category',
        displayName: 'Category',
        width: 100,
      }, {
        field: 'description.type',
        displayName: 'Type',
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'apparatus_data.extended_data.turnout_duration',
        displayName: 'Turnout',
        cellFilter: 'humanizeDuration',
      }, {
        field: 'apparatus_data.extended_data.travel_duration',
        displayName: 'Travel',
        cellFilter: 'humanizeDuration',
      }, {
        field: 'apparatus_data.extended_data.event_duration',
        displayName: 'Commitment',
        cellFilter: 'humanizeDuration',
      }]
    };

    this.timeFilters = [{
      id: 'shift',
      displayName: 'Last Shift',
    }, {
      id: 'day',
      displayName: 'Last Day',
    }, {
      id: 'week',
      displayName: 'Last Week',
    }, {
      id: 'month',
      displayName: 'Last Month',
    }, {
      id: 'quarter',
      displayName: 'Last Quarter',
    }, {
      id: 'year',
      displayName: 'Last Year',
    }];

    this.disposer = autorun(() => {
      this.selected = this.unitStore.selected;

      this.responsesTableOptions.data = this.unitStore.responses;

      this.currentMetrics = this.unitStore.currentMetrics;
      this.previousMetrics = this.unitStore.previousMetrics;
      this.totalMetrics = this.unitStore.totalMetrics;

      this.selectedTime = this.uiStore.selectedFilters.timeFilter.id;

      // abstract this to component do this server side
      if(this.totalMetrics) {
        let arr = _.values(this.totalMetrics.time_series_data.total_data);
        arr = _.filter(arr, a => !_.isEmpty(a));
        this.totalIncidentMin = _.minBy(arr, 'total_count');
        this.totalIncidentAvg = _.meanBy(arr, 'total_count');
        this.totalIncidentMax = _.maxBy(arr, 'total_count');

        this.totalCommitmentMin = _.minBy(arr, 'total_commitment_time_seconds');
        this.totalCommitmentAvg = _.meanBy(arr, 'total_commitment_time_seconds');
        this.totalCommitmentMax = _.maxBy(arr, 'total_commitment_time_seconds');
      }
      $scope.$evalAsync();
    });
  }

  changeFilter() {
    console.dir(this.selectedTime)
    this.$state.go('site.reporting.unit.detail', { id: this.unitStore.selected.id, time: this.selectedTime });
  }

  $onDestory() {
    if(this.disposer) this.disposer();
  }

  selectUnit(selected) {
    this.$state.go('site.reporting.unit.detail', { id: selected.id, time: 'shift' });
  }

  humanizeDuration(ms) {
    return shortEnglishHumanizer(ms, { round: true });
  }

  scrollTo(location) {
    $('html, body').animate({ scrollTop: $(location).offset().top - 65 }, 1000);
  }
}
