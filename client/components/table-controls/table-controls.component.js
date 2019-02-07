'use strict';

import angular from 'angular';
import _ from 'lodash';

export class TableControlsController {
  pagination;
  sort;
  onPaginationChange;
  onSortChange;
  isLoading;
  position;
  showSort;
  columnDefs = [];

  $onInit() {
    this.sort = this.sort || {
      selectedColumn: null,
      columnDefs: [],
    };
    this.onPaginationChange = this.onPaginationChange || (()=>{});
    this.onSortChange = this.onSortChange || (()=>{});
    this.position = this.position || 'bottom';
    this.showSort = (!_.isUndefined(this.showSort)) ? this.showSort : true;

    // Generate ascending/descending sort options.
    const generatedColumnDefs = [];
    this.sort.columnDefs.forEach((columnDef) => {
      generatedColumnDefs.push({
        displayName: `${columnDef.displayName} (ASC)`,
        field: columnDef.field,
        direction: 'asc',
      });
      generatedColumnDefs.push({
        displayName: `${columnDef.displayName} (DESC)`,
        field: columnDef.field,
        direction: 'desc',
      });
    });
    this.columnDefs = generatedColumnDefs;
  }

  get totalPages() {
    return Math.ceil(this.pagination.totalItems / this.pagination.pageSize);
  }

  get pageNumbers() {
    return _.range(1, this.totalPages + 1);
  }

  pageGetterSetter(value) {
    if(_.isUndefined(value)) {
      return this.pagination.page;
    } else {
      this.pagination.page = value || 1;
      this.fireOnPaginationChange();
    }
  }

  pageSizeGetterSetter(value) {
    if(_.isUndefined(value)) {
      return this.pagination.pageSize;
    } else {
      this.pagination.pageSize = value;
      this.fireOnPaginationChange();
    }
  }

  prevButtonClick() {
    if(this.pagination.page === 1) {
      return;
    }

    this.pagination.page--;
    this.fireOnPaginationChange();
  }

  nextButtonClick() {
    if(this.pagination.page === this.totalPages) {
      return;
    }

    this.pagination.page++;
    this.fireOnPaginationChange();
  }

  fireOnPaginationChange() {
    this.onPaginationChange({ pagination: this.pagination });
  }

  sortGetterSetter(value) {
    if(_.isUndefined(value)) {
      return (this.sort.selectedColumn) ? this.sortColumnToValue(this.sort.selectedColumn) : undefined;
    } else {
      this.sort.selectedColumn = this.sortValueToColumn(value);
      this.onSortChange({ sort: this.sort });
    }
  }

  sortColumnToValue(sortColumn) {
    return `${sortColumn.field},${sortColumn.direction}`;
  }

  sortValueToColumn(sortString) {
    const parts = sortString.split(',');
    return {
      field: parts[0],
      direction: parts[1],
    };
  }
}

export default angular.module('tableControls', [])
  .component('tableControls', {
    template: require('./table-controls.component.html'),
    controller: TableControlsController,
    controllerAs: 'vm',
    bindings: {
      pagination: '=',
      sort: '=?',
      onPaginationChange: '&?',
      onSortChange: '&?',
      isLoading: '<?',
      position: '@?',
      showSort: '<?',
    },
  })
  .name;
