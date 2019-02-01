/* eslint  class-methods-use-this: 0 */

'use strict';

let _;

export default class IncidentSearchController {
  page = 1;
  pageSize = 100;
  sort;
  search;
  searchInputValue;
  isLoading = true;
  uiGridApi;

  /*@ngInject*/
  constructor($scope, AmplitudeService, AnalyticEventNames, Incident) {
    this.IncidentService = Incident;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    this.uiGridOptions = {
      data: [],
      paginationPageSizes: [10, 25, 50, 100],
      paginationPageSize: this.pageSize,
      paginationCurrentPage: this.page,
      totalItems: 0,
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col ) }}</a></div>',
      }, {
        field: 'address.address_line1',
        displayName: 'Address'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed',
        cellFilter: 'date:"MMM d, y HH:mm:ss"'
      }, {
        field: 'durations.total_event.seconds',
        displayName: 'Event Duration',
        cellFilter: 'humanizeDuration',
      }, {
        field: 'description.units',
        displayName: '# Units',
        width: 100,
        cellTemplate: '<div class="ui-grid-cell-contents">{{ grid.getCellValue(row, col ).length }}</div>',
        enableSorting: false,
      }, {
        field: 'description.category',
        displayName: 'Category',
        width: 100,
      }, {
        field: 'description.type',
        displayName: 'Type',
      }],
      useExternalPagination: true,
      useExternalSorting: true,
      enableHorizontalScrollbar: false,
      onRegisterApi: (uiGridApi) => {
        this.uiGridApi = uiGridApi;
        uiGridApi.pagination.on.paginationChanged($scope, (newPage, pageSize) => { this.paginationChanged(newPage, pageSize) });
        uiGridApi.core.on.sortChanged($scope, (uiGrid, sortColumns) => { this.sortChanged(uiGrid, sortColumns); });
      },
    };
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();
    this.refreshIncidentsList();
  }

  paginationChanged(newPage, pageSize) {
    this.page = newPage;
    this.pageSize = pageSize;
    this.refreshIncidentsList();
  }

  sortChanged(uiGrid, sortColumns) {
    if(sortColumns.length > 0) {
      this.sort = sortColumns.map(column => {
        return `${column.field},${column.sort.direction}`;
      }).join('+');
    } else {
      this.sort = undefined;
    }
    this.refreshIncidentsList();
  }

  async refreshIncidentsList() {
    this.uiGridOptions.data = [];
    this.isLoading = true;

    const data = await this.IncidentService.get({
      count: this.pageSize,
      from: (this.page - 1) * this.pageSize,
      sort: this.sort,
      search: this.search,
    }).$promise;
    this.uiGridOptions.data = data.items.map(item => item._source);
    this.uiGridOptions.totalItems = data.totalItems;

    this.isLoading = false;
  }

  async searchButtonClick() {
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
}
