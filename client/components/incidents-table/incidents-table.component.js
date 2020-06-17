'use strict';

import angular from 'angular';
import tableControls from '../table-controls/table-controls.component';

let _;

export class IncidentsTableController {
  incidents;
  uiGridColumnDefs;
  onUiGridInit;
  pagination;
  sort;
  isLoading;
  isLoadingFirst;
  onPaginationChange;
  onSortChange;
  useExternalPagination;
  useExternalSorting;
  showControls;
  minRowsToShow;

  initialized = false;
  sortSelect;
  uiGridApi;

  constructor($window, $scope, $filter, $element) {
    this.$window = $window;
    this.$scope = $scope;
    this.$filter = $filter;
    this.$element = $element;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.showControls = (!_.isUndefined(this.showControls)) ? this.showControls : true;

    if(!this.pagination) {
      this.pagination = {
        page: 1,
        pageSize: (this.$window.innerWidth <= 1200) ? 25 : 100,
        pageSizes: [10, 25, 50, 100],
        totalItems: 0,
      };
    }

    if(!this.sort) {
      this.sort = {
        columns: [{
          field: 'description.event_closed',
          direction: 'desc',
        }],
      };
    }

    this.sortSelect = {
      selectedColumn: this.sort.columns[0],
      columnDefs: [],
    };

    this.onPaginationChange = this.onPaginationChange || (()=>{});
    this.onSortChange = this.onSortChange || (()=>{});

    angular.element(this.$window).bind('resize', () => {
      // Mobile only supports sorting by 1 column, so enforce this on resize to mobile.
      if(this.$window.innerWidth <= 1200 && this.sort.columns.length > 1) {
        this.sort.columns = this.sort.columns.slice(0, 1);
        this.sortSelect.selectedColumn = this.sort.columns[0];
        this.updateUiGridSort();
      }
    });

    this.uiGridOptions = {
      columnDefs: this.uiGridColumnDefs,
      data: this.incidents || [],
      paginationPageSizes: this.pagination.pageSizes,
      paginationPageSize: this.pagination.pageSize,
      paginationCurrentPage: this.pagination.page,
      totalItems: this.pagination.totalItems,
      enablePaginationControls: false,
      useExternalPagination: this.useExternalPagination,
      useExternalSorting: this.useExternalSorting,
      enableHorizontalScrollbar: false,
      minRowsToShow: this.minRowsToShow,
      onRegisterApi: (uiGridApi) => {
        this.uiGridApi = uiGridApi;
        uiGridApi.core.on.sortChanged(this.$scope, (uiGrid, sortColumns) => {
          this.sort.columns = sortColumns.map((sortColumn) => ({
            field: sortColumn.field,
            direction: sortColumn.sort.direction,
          }));
          this.sortSelect.selectedColumn = this.sort.columns[0];
          this.fireOnSortChange();
        });

        if (this.onUiGridInit) {
          this.onUiGridInit({ uiGridApi });
        }
      },
    };

    this.$scope.$watch('vm.minRowsToShow', () => {
      if (this.uiGridOptions) {
        this.uiGridOptions.minRowsToShow = this.minRowsToShow;
      }
    });

    this.$scope.$watch('vm.uiGridColumnDefs', () => {
      if (this.uiGridOptions) {
        this.uiGridOptions.columnDefs = this.uiGridColumnDefs;
      }
    });

    // In sort select only show columns with sorting enabled.
    this.sortSelect.columnDefs = this.uiGridOptions.columnDefs.filter((columnDef) => {
      return (_.isUndefined(columnDef.enableSorting) || columnDef.enableSorting);
    });

    this.initialized = true;
  }

  $onChanges() {
    if(!this.initialized) {
      return;
    }

    this.uiGridOptions.data = this.incidents || [];
    this.uiGridOptions.totalItems = this.pagination.totalItems;
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
      const filterParts = columnDef.cellFilter.split(':');
      const filterType = filterParts[0];
      if(filterParts.length > 1) {
        // Get the filter expression and trim the quote marks off of it.
        const filterExpression = columnDef.cellFilter.slice(filterType.length + 1).slice(1, -1);
        value = this.$filter(filterType)(value, filterExpression);
      } else {
        value = this.$filter(filterType)(value);
      }
    }

    return value;
  }

  getIncidentUiSref(incident) {
    return `site.incident.analysis({ id: '${incident.description.incident_number}' })`;
  }

  handlePaginationChange() {
    this.$element.find('.ui-grid-viewport')[0].scrollTop = 0;
    this.fireOnPaginationChange();
  }

  handleSortChange(args) {
    this.sort.columns = [args.sort.selectedColumn];
    this.updateUiGridSort();
    this.fireOnSortChange();
  }

  updateUiGridSort() {
    const gridColumn = this.uiGridApi.grid.getColumn(this.sort.columns[0].field);
    this.uiGridApi.grid.sortColumn(gridColumn, this.sort.columns[0].direction);
  }

  fireOnPaginationChange() {
    this.onPaginationChange({ pagination: this.pagination });
  }

  fireOnSortChange() {
    this.onSortChange({ sort: this.sort });
  }
}

export default angular.module('incidentsTable', [tableControls])
  .component('incidentsTable', {
    template: require('./incidents-table.component.html'),
    controller: IncidentsTableController,
    controllerAs: 'vm',
    bindings: {
      incidents: '<',
      uiGridColumnDefs: '<',
      onUiGridInit: '&?',
      pagination: '=?',
      sort: '=?',
      isLoading: '<?',
      isLoadingFirst: '<?',
      onPaginationChange: '&?',
      onSortChange: '&?',
      useExternalPagination: '<?',
      useExternalSorting: '<?',
      showControls: '<?',
      minRowsToShow: '<?',
    },
  })
  .name
