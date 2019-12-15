/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment-timezone';
import humanizeDuration from 'humanize-duration';
import { FirecaresLookup } from '@statengine/shiftly/lib';

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

export default class ReportingUnitController {
  isFetching = false;
  isFetchingIncidentsTableResponses = false;
  didFetchInitial = false;
  isTravelTimeCollapsed = true;
  isTurnoutTimeCollapsed = true;
  timeFilters;
  _selectedTimeFilterId;
  _selectedTimeFilter;
  overlay;
  incidentsTimeline = {
    incidents: [],
  };
  incidentsTable;

  /*@ngInject*/
  constructor($scope, $window, $location, $state, $stateParams, $transitions, $timeout, AmplitudeService,
              AnalyticEventNames, currentPrincipal, Unit, units) {
    this.$scope = $scope;
    this.$window = $window;
    this.$location = $location;
    this.$state = $state;
    this.$timeout = $timeout;
    this.timeZone = currentPrincipal.FireDepartment.timezone;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.Unit = Unit;
    this.units = units;

    this.buildTimeFilters();
    this.selectedTimeFilterId = $stateParams.time || 'shift';

    this.incidentsTable = {
      incidents: [],
      pagination: {
        page: 1,
        pageSize: (this.$window.innerWidth <= 1200) ? 25 : 100,
        pageSizes: [10, 25, 50, 100],
        totalItems: 0,
      },
      sort: {
        columns: [{
          field: 'description.event_closed',
          direction: 'desc',
        }],
      },
      uiGridColumnDefs: [{
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
        displayName: 'Event Closed',
        cellFilter: 'date:"MMM d, y HH:mm:ss"',
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
      }],
    };

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
      app: 'Unit Analysis',
      action: 'view',
    });

    $transitions.onStart({}, () => {
      // If we're showing an overlay then the main scrollbar is hidden. Re-enable it before transitioning to a new page.
      if(this.overlay != null) {
        angular.element('html').css('overflow', 'auto');
      }
    });
  }

  async $onInit() {
    await this.fetchUnitData();

    this.removeResizeEventListener = this.$window.addEventListener('resize', () => {
      // If we just resized from mobile to desktop and a unit isn't selected, automatically select the first one.
      if(this.$window.innerWidth >= 992 && this.selectedUnitId == null) {
        this.selectedUnitId = this.units[0].id;
        this.fetchUnitData();
      }
    });

    this.$scope.$on('$destroy', () => {
      this.removeResizeEventListener();
    });

    // HACK: The Edge browser doesn't render graphs in overlays until a 'resize' event occurs.
    //       This seems like a flexbox-related bug in Edge. It doesn't occur in any other browser.
    setTimeout(() => {
      this.$window.dispatchEvent(new Event('resize'));
    });
  }

  get selectedTimeFilterId() {
    return this._selectedTimeFilterId;
  }

  set selectedTimeFilterId(value) {
    this._selectedTimeFilterId = value;
    this.$location.search('time', this._selectedTimeFilterId);

    this._selectedTimeFilter = _.find(this.timeFilters, tf => tf.id === this.selectedTimeFilterId);
    if(!this._selectedTimeFilter) {
      this._selectedTimeFilter = self.timeFilters[0];
    }
  }

  selectedTimeFilterIdGetterSetter(timeFilterId) {
    if(_.isUndefined(timeFilterId)) {
      return this.selectedTimeFilterId;
    } else {
      this.selectedTimeFilterId = timeFilterId;
      this.fetchUnitData();
    }
  }

  get selectedTimeFilter() {
    return this._selectedTimeFilter;
  }

  get selectedUnitId() {
    const selectedUnitId = this.$location.hash();
    return (selectedUnitId !== '') ? selectedUnitId : undefined;
  }

  set selectedUnitId(value) {
    this.$location.hash(value);
  }

  selectUnit(selected) {
    angular.element('.reporting-unit-content').scrollTop(0);
    this.selectedUnitId = selected.id;
    this.overlay = undefined;
    this.fetchUnitData();
  }

  deselectUnit() {
    angular.element('.reporting-unit-content').scrollTop(0);
    this.selectedUnitId = null;
    this.overlay = undefined;
  }

  humanizeDuration(ms) {
    return shortEnglishHumanizer(ms, { round: true, spacer: '' });
  }

  scrollTo(location) {
    if(location === '#travelTimeHeader') {
      $('#travelTimeCollapse').collapse('show');
      this.isTravelTimeCollapsed = false;
      this.collapsedGraphResizeHack();
    } else if(location === '#turnoutTimeHeader') {
      $('#turnoutTimeCollapse').collapse('show');
      this.isTurnoutTimeCollapsed = false;
      this.collapsedGraphResizeHack();
    }

    $('.reporting-unit-content').animate({ scrollTop: $(location).offset().top - 80 }, 1000);
  }

  showOverlay(overlayName) {
    this.overlay = overlayName;
  }

  hideOverlay() {
    this.overlay = undefined;
  }

  handleTravelTimeHeaderClick() {
    this.isTravelTimeCollapsed = !this.isTravelTimeCollapsed;
    this.collapsedGraphResizeHack();
  }

  handleTurnoutTimeHeaderClick() {
    this.isTurnoutTimeCollapsed = !this.isTurnoutTimeCollapsed;
    this.collapsedGraphResizeHack();
  }

  collapsedGraphResizeHack() {
    // HACK: This fixes an issue where graphs contained in a collapsed element don't size properly
    // until a resize event occurs.
    this.$timeout(() => {
      this.$window.dispatchEvent(new Event('resize'));
    });
  }

  async fetchUnitData() {
    if (this.selectedUnitId == null) {
      return;
    }

    this.isFetching = true;

    await this.fetchIncidentsTimelineData();
    await this.fetchIncidentsTableData();
    await this.fetchMetrics();
    await this.fetchPreviousMetrics();
    await this.fetchMetricsTotal();

    this.isFetching = false;
    this.didFetchInitial = true;
  }

  async fetchIncidentsTableData() {
    this.isFetchingIncidentsTableResponses = true;
    const pageSize = this.incidentsTable.pagination.pageSize;
    const page = this.incidentsTable.pagination.page;

    const data = await this.Unit.getResponses({
      id: this.selectedUnitId,
      timeStart: this.selectedTimeFilter.filter.start,
      timeEnd: this.selectedTimeFilter.filter.end,
      from: (page - 1) * pageSize,
      size: pageSize,
      sort: this.incidentsTable.sort.columns.map((sortColumn) => {
        return `${sortColumn.field},${sortColumn.direction}`;
      }).join('+'),
    }).$promise;

    this.incidentsTable.incidents = data.items;
    this.incidentsTable.pagination.totalItems = data.totalItems;

    this.isFetchingIncidentsTableResponses = false;
  }

  async fetchIncidentsTimelineData() {
    const data = await this.Unit.getResponses({
      id: this.selectedUnitId,
      timeStart: this.selectedTimeFilter.filter.start,
      timeEnd: this.selectedTimeFilter.filter.end,
      from: 0,
      size: 100,
    }).$promise;

    this.incidentsTimeline.incidents = data.items;
  }

  async fetchMetrics() {
    this.currentMetrics = await this.Unit.getMetrics({
      id: this.selectedUnitId,
      timeStart: this.selectedTimeFilter.filter.start,
      timeEnd: this.selectedTimeFilter.filter.end,
      subInterval: this.selectedTimeFilter.filter.subInterval,
    }).$promise;

    this.responseData = Object.entries(this.currentMetrics.grouped_data.category).map(n => ({
      value: n[0],
      count: n[1].total_count || 0,
      metric: n[1].total_count || 0,
      color: n[0] === 'FIRE' ? '#f3786b' : n[0] === 'EMS' ? '#5fb5c8' : '#f8b700',
    }));
  }

  async fetchPreviousMetrics() {
    const timeStart = this.selectedTimeFilter.filter.start;
    const timeEnd = this.selectedTimeFilter.filter.end;
    const duration = moment.duration(moment(timeEnd).diff(moment(timeStart)));

    this.previousMetrics = await this.Unit.getMetrics({
      id: this.selectedUnitId,
      timeStart: moment.parseZone(timeStart).subtract(duration.asMilliseconds(), 'milliseconds').format(),
      timeEnd: timeStart,
      subInterval: this.selectedTimeFilter.filter.subInterval,
    }).$promise;
  }

  async fetchMetricsTotal() {
    this.metricsTotal = await this.Unit.getMetricsTotal({
      id: this.selectedUnitId,
      timeStart: this.selectedTimeFilter.filter.start,
      timeEnd: this.selectedTimeFilter.filter.end,
      interval: this.selectedTimeFilter.filter.interval,
    }).$promise;

    // abstract this to component do this server side
    if(this.metricsTotal) {
      let arr = _.values(this.metricsTotal.time_series_data.total_data);
      arr = _.filter(arr, a => !_.isEmpty(a));
      this.totalIncidentMin = _.minBy(arr, 'total_count');
      this.totalIncidentAvg = _.meanBy(arr, 'total_count');
      this.totalIncidentMax = _.maxBy(arr, 'total_count');
      this.totalIncidentCounts = arr.map(a => a.total_count);
      this.totalCommitTimes = arr.map(a => a.total_commitment_time_seconds);

      this.totalCommitmentMin = _.minBy(arr, 'total_commitment_time_seconds');
      this.totalCommitmentAvg = _.meanBy(arr, 'total_commitment_time_seconds');
      this.totalCommitmentMax = _.maxBy(arr, 'total_commitment_time_seconds');
    }
  }

  async handleIncidentsPaginationChange() {
    await this.fetchIncidentsTableData();
    angular.element('.incidents-overlay-window')[0].scrollTop = 0;
  }

  handleIncidentsTableSortChange() {
    this.fetchIncidentsTableData();
  }

  buildTimeFilters() {
    const fireDepartment = this.currentPrincipal.FireDepartment;
    const ShiftConfiguration = FirecaresLookup[fireDepartment.firecares_id];
    const shiftly = new ShiftConfiguration();

    const now = moment.tz(fireDepartment.timezone);
    const quickFilters = {};

    const shiftTimeframe = shiftly.shiftTimeFrame(moment.tz(fireDepartment.timezone).subtract(1, 'day').format());
    quickFilters.shift = {
      start: shiftTimeframe.start,
      end: shiftTimeframe.end,
      interval: 'day',
      subInterval: 'hour',
    };

    const intervals = [{
      interval: 'day',
      subInterval: 'hour',
    }, {
      interval: 'week',
      subInterval: 'day',
    }, {
      interval: 'month',
      subInterval: 'day',
    }, {
      interval: 'quarter',
      subInterval: 'week',
    }, {
      interval: 'year',
      subInterval: 'month'
    }];

    _.forEach(intervals, i => {
      const umStart = moment(now).subtract(1, i.interval)
        .startOf(i.interval);
      const umEnd = moment(umStart).endOf(i.interval);

      quickFilters[i.interval] = {
        start: umStart.format(),
        end: umEnd.format(),
        interval: i.interval,
        subInterval: i.subInterval
      };
    });

    const timeFilters = [];
    _.forOwn(quickFilters, (filter, key) => timeFilters.push({ id: key, displayName: `Last ${key}`, filter }));

    this.timeFilters = timeFilters;
  }

  isLargeScreen() {
    return (this.$window.innerWidth >= 992)
  }

  isDataAvailable() {
    return (this.currentMetrics.total_data && this.currentMetrics.total_data.total_count > 0)
  }

  isIncidentCategoryDataAvailable() {
    return (Object.keys(this.currentMetrics.time_series_data.grouped_data.category).length > 0)
  }
}
