/* eslint  class-methods-use-this: 0 */

'use strict';

import angular from 'angular';
import _ from 'lodash';

export default class IncidentSearchController {
  incidents = [];
  pagination = {
    page: 1,
    pageSize: 100,
    pageSizes: [10, 25, 50, 100],
    totalItems: 0,
  };
  sortColumns = [{
    field: 'description.event_closed',
    direction: 'desc',
  }];
  sortSelect = {
    selectedColumn: this.sortColumns[0],
    columnDefs: [],
  };
  search;
  searchInputValue;
  isLoading = true;
  isLoadingFirst = true;
  uiGridOptions;
  uiGridApi;

  /*@ngInject*/
  constructor($window, $scope, $filter, AmplitudeService, AnalyticEventNames, Incident) {
    this.$window = $window;
    this.$filter = $filter;
    this.IncidentService = Incident;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;

    // Set a smaller default page size on mobile.
    if($window.innerWidth <= 1200) {
      this.pagination.pageSize = this.pagination.pageSizes[1];
    }

    angular.element($window).bind('resize', () => {
      // Mobile only supports sorting by 1 column, so enforce this on resize to mobile.
      if($window.innerWidth <= 1200 && this.sortColumns.length > 1) {
        this.sortColumns = this.sortColumns.slice(0, 1);
        this.sortSelect.selectedColumn = this.sortColumns[0];
        this.updateUiGridSort();
      }
    });

    this.uiGridOptions = {
      data: this.incidents,
      paginationPageSizes: this.pagination.pageSizes,
      paginationPageSize: this.pagination.pageSize,
      paginationCurrentPage: this.pagination.page,
      totalItems: this.pagination.totalItems,
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
      }],
      enablePaginationControls: false,
      useExternalPagination: true,
      useExternalSorting: true,
      enableHorizontalScrollbar: false,
      onRegisterApi: (uiGridApi) => {
        this.uiGridApi = uiGridApi;
        uiGridApi.core.on.sortChanged($scope, (uiGrid, sortColumns) => {
          this.sortColumns = sortColumns.map((sortColumn) => ({
            field: sortColumn.field,
            direction: sortColumn.sort.direction,
          }));
          this.sortSelect.selectedColumn = this.sortColumns[0];
          this.refreshIncidentsList();
        });
      },
    };

    // In sort select only show columns with sorting enabled.
    this.sortSelect.columnDefs = this.uiGridOptions.columnDefs.filter((columnDef) => {
      return (_.isUndefined(columnDef.enableSorting) || columnDef.enableSorting);
    });

    this.refreshIncidentsList = _.debounce(this.refreshIncidentsList, 350, {
      leading: true,
      trailing: true,
    });
  }

  async $onInit() {
    this.refreshIncidentsList();
  }

  getIncidentColumn(incident, columnDef) {
    // Translate incident field string into the incident data (ex. 'description.units.length' -> `incident['description']['units']['length']).
    const fieldParts = columnDef.field.split('.');
    let value = incident;
    for(const part of fieldParts) {
      value = value[part];
    }

    // Apply filter if the column def has one.
    if(columnDef.cellFilter) {
      const filterType = columnDef.cellFilter.split(':')[0];
      const filterExpression = columnDef.cellFilter.match(/(?<=")(.*)(?=")/g);
      value = this.$filter(filterType)(value, filterExpression);
    }

    return value;
  }

  getIncidentUiSref(incident) {
    return `site.incident.analysis({ id: '${incident.description.incident_number}' })`;
  }

  async refreshIncidentsList() {
    this.isLoading = true;

    const sort = this.sortColumns.map((sortColumn) => {
      return `${sortColumn.field},${sortColumn.direction}`;
    }).join('+');

    const data = await this.IncidentService.get({
      count: this.pagination.pageSize,
      from: (this.pagination.page - 1) * this.pagination.pageSize,
      sort,
      search: this.search,
    }).$promise;
    this.incidents = data.items.map(item => item._source);
    this.pagination.totalItems = data.totalItems;

    // Compute 'unitCount' from 'units'.
    this.incidents.forEach((incident) => {
      incident.description.units_count = incident.description.units.length;
    });

    // Update uiGrid.
    this.uiGridOptions.data = this.incidents;
    this.uiGridOptions.totalItems = this.pagination.totalItems;

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

  handleSortChange(args) {
    this.sortColumns = [args.sort.selectedColumn];
    this.updateUiGridSort();
  }

  updateUiGridSort() {
    const gridColumn = this.uiGridApi.grid.getColumn(this.sortColumns[0].field);
    this.uiGridApi.grid.sortColumn(gridColumn, this.sortColumns[0].direction);
  }
}
