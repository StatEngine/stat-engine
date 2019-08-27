'use strict';

import angular from 'angular';
import viewMode from '../view-mode/view-mode.component';
import dashboardCard from '../dashboard-card/dashboard-card.component';

export class AddDashboardsOverlay {
  show;
  onConfirm;
  sortByOptions = [{
    id: 'popularity',
    displayName: 'Popularity',
  }, {
    id: 'alphabetical',
    displayName: 'Alphabetical',
  }, {
    id: 'newest',
    displayName: 'Newest',
  }, {
    id: 'lastUpdated',
    displayName: 'Last Updated'
  }];
  searchQuery;
  sortBy;
  viewMode;
  dashboards;
  selectedDashboards;

  /*@ngInject*/
  constructor($scope, $window, Modal, FixtureTemplate) {
    this.Modal = Modal;
    this.FixtureTemplate = FixtureTemplate;

    $scope.$watch('vm.sortBy', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      this.loadDashboards();
    });

    $scope.$watch('vm.show', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      if (this.show) {
        this.reset();
      }
    });
  }

  $onInit() {
    this.reset();
    this.loadDashboards();
  }

  reset() {
    this.searchQuery = '';
    this.sortBy = this.sortByOptions[0].id;
    this.viewMode = 'grid';
    this.selectedDashboards = {};
  }

  async loadDashboards() {
    this.dashboards = await this.FixtureTemplate.getDashboards().$promise;
    this.dashboards.forEach(dashboard => {
      dashboard.htmlId = dashboard._id.replace(/:/g, '-');
      dashboard.rotation = 0;
      dashboard.description += dashboard.description;
      dashboard.description += dashboard.description;
      dashboard.description += dashboard.description;
      dashboard.description += dashboard.description;
    });
  }

  get isAddSelectedButtonDisabled() {
    return (this.selectedDashboardCount === 0);
  }

  get selectedDashboardCount() {
    return Object.keys(this.selectedDashboards).length
  }

  isDashboardSelected(dashboard) {
    return !!this.selectedDashboards[dashboard._id];
  }

  toggleDashboardSelected(dashboard) {
    if (this.selectedDashboards[dashboard._id]) {
      delete this.selectedDashboards[dashboard._id];
    } else {
      this.selectedDashboards[dashboard._id] = dashboard;
    }
  }

  closeButtonClick() {
    if (this.selectedDashboardCount === 0) {
      this.show = false;
    } else {
      // Show a warning modal.
      this.Modal.confirm({
        title: 'Close',
        content: 'Are you sure? Your selected dashboards will not be added.',
        confirmButtonStyle: this.Modal.buttonStyle.danger,
        showCloseButton: false,
        enableBackdropDismiss: false,
        onConfirm: () => {
          this.show = false;
        },
      }).present();
    }
  }

  handleAddSelectedClick() {
    this.show = false;
    if (this.onConfirm) {
      // Convert selected dashboards to an array.
      this.onConfirm({
        selectedDashboards: Object.keys(this.selectedDashboards)
          .map(id => this.selectedDashboards[id]),
      });
    }
  }
}

export default angular.module('addDashboardsOverlay', [viewMode, dashboardCard])
  .component('addDashboardsOverlay', {
    template: require('./add-dashboards-overlay.html'),
    controller: AddDashboardsOverlay,
    controllerAs: 'vm',
    bindings: {
      show: '=',
      onConfirm: '&?',
    },
  })
  .name;