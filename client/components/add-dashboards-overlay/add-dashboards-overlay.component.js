'use strict';

import angular from 'angular';
import viewMode from '../view-mode/view-mode.component';
import dashboardCard from '../dashboard-card/dashboard-card.component';

export class AddDashboardsOverlay {
  show;
  onConfirm;
  viewMode;
  dashboards;
  selectedDashboards;

  /*@ngInject*/
  constructor($scope, $window, $timeout, Modal, FixtureTemplate) {
    this.$window = $window;
    this.$timeout = $timeout;
    this.Modal = Modal;
    this.FixtureTemplate = FixtureTemplate;

    $scope.$watch('vm.show', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      if (this.show) {
        this.reset();
      }
    });

    this.$window.addEventListener('resize', this.handleResize);
    this.handleResize();
  }

  $onInit() {
    this.reset();
    this.loadDashboards();
  }

  handleResize = () => {
    this.$timeout(() => {
      // On small screens, force 'grid' view mode.
      if (this.$window.innerWidth < 576) {
        this.viewMode = 'grid';
      }
    });
  };

  reset() {
    this.viewMode = 'grid';
    this.selectedDashboards = {};
  }

  async loadDashboards() {
    this.dashboards = await this.FixtureTemplate.getDashboards().$promise;
    this.dashboards.forEach(dashboard => {
      dashboard.htmlId = dashboard._id.replace(/:/g, '-');
      dashboard.rotation = 0;
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
      const selectedDashboards = Object.keys(this.selectedDashboards)
        .map(id => this.selectedDashboards[id]);

      this.onConfirm({ selectedDashboards: _.cloneDeep(selectedDashboards) });
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
