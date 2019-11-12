/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment-timezone';

export default class IncidentSearchController {
  incidents = [];
  pagination = {
    page: 1,
    pageSize: 100,
    pageSizes: [10, 25, 50, 100],
    totalItems: 0,
  };
  sort = {
    columns: [{
      field: 'description.event_closed',
      direction: 'desc',
    }],
  };
  search;
  searchInputValue;
  isLoading = true;
  isLoadingFirst = true;
  uiGridColumnDefs;

  /*@ngInject*/
  constructor($window, $scope, AmplitudeService, AnalyticEventNames, Incident, currentPrincipal) {
    this.$scope = $scope;
    this.$window = $window;
    this.IncidentService = Incident;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.fireDepartment = currentPrincipal.FireDepartment;

    this.uiGridColumnDefs = [{
      field: 'description.incident_number',
      displayName: 'Incident Number',
      cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col ) }}</a></div>',
    }, {
      field: 'address.address_line1',
      displayName: 'Address'
    }, {
      field: 'description.event_closed',
      displayName: 'Event Closed',
      cellFilter: 'date:"MMM d, y HH:mm:ss"',
      defaultSort: {
        direction: 'desc',
        priority: 0,
      },
    }, {
      field: 'durations.total_event.seconds',
      displayName: 'Event Duration',
      cellFilter: 'humanizeDuration',
    }, {
      field: 'description.units_count',
      displayName: '# Units',
      width: 100,
      enableSorting: false,
    }, {
      field: 'description.category',
      displayName: 'Category',
      width: 100,
    }, {
      field: 'description.type',
      displayName: 'Type',
    }];

    this.refreshIncidentsList = _.debounce(this.refreshIncidentsList, 350, {
      leading: true,
      trailing: true,
    });

    this.initRangeFilter()
  }

  async $onInit() {
    this.refreshIncidentsList();
  }

  async refreshIncidentsList() {
    this.isLoading = true;

    const sort = this.sort.columns.map((sortColumn) => {
      return `${sortColumn.field},${sortColumn.direction}`;
    }).join('+');

    const data = await this.IncidentService.get({
      count: this.pagination.pageSize,
      from: (this.pagination.page - 1) * this.pagination.pageSize,
      sort,
      search: this.search,
    }).$promise;
    this.incidents = data.items.map(item => item._source);

    this.incidents = this.incidents.filter(incident => {
      const dateClosed = new Date(incident.description.event_closed);
      if (this.rangeFromDateTz && dateClosed.getTime() < this.rangeFromDateTz.getTime()) {
        return false;
      } else if (this.rangeToDateTz && dateClosed.getTime() > this.rangeToDateTz.getTime()) {
        return false;
      }
      return true;
    });

    this.pagination.totalItems = data.totalItems;

    // HACK: Compute 'unitCount' from 'units' (this should be preprocessed in the database).
    this.incidents.forEach((incident) => {
      incident.description.units_count = incident.description.units.length;
    });

    this.isLoading = false;
    this.isLoadingFirst = false;

    // On mobile, automaticallys scroll back to the top on data refresh.
    if(this.$window.innerWidth <= 1200) {
      const page = angular.element('html')[0];
      page.scrollTop = 0;
    }
  }

  searchButtonClick() {
    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
      app: 'Incident Analysis',
      action: 'search',
    });

    let search = this.searchInputValue.trim();
    if(search === '') {
      search = undefined;
    }
    this.search = search;
    this.refreshIncidentsList();
  }

  handlePaginationChange() {
    this.refreshIncidentsList();
  }

  handleSortChange() {
    this.refreshIncidentsList();
  }

  initRangeFilter() {
    this.$scope.fromDatePopup = { opened: false };
    this.$scope.openFromDatePopup = () => {
      this.$scope.fromDatePopup.opened = true;
    };
    this.$scope.toDatePopup = { opened: false };
    this.$scope.openToDatePopup = () => {
      this.$scope.toDatePopup.opened = true;
    };
  }

  getRangeDate(time, date) {
    if (!date) return null;
    const fromHoursTime = !time ? 0 : (time.getHours() * 60 * 60 * 1000);
    const fromMinutesTime = !time ? 0 : (time.getMinutes() * 60 * 1000);
    return new Date(date.getTime() + fromHoursTime + fromMinutesTime);
  }

  onDateRangeChanged() {
    const { fromDate, fromTime, toDate,toTime } = this.$scope;
    const { timezone } = this.fireDepartment;
    this.rangeFromDate = this.getRangeDate(fromTime, fromDate);
    this.rangeToDate = this.getRangeDate(toTime, toDate);

    if (this.rangeFromDate) {
      this.rangeFromDateTz = new Date(moment.tz(this.rangeFromDate, timezone).format());
    }

    if (this.rangeToDate) {
      this.rangeToDateTz = new Date(moment.tz(this.rangeToDate, timezone).format());
    }

    this.refreshIncidentsList();
  }
}
