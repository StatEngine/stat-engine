'use strict';

import angular from 'angular';
import viewMode from '../view-mode/view-mode.component';

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

    $window.addEventListener('resize', () => {
      this.updateReadMoreLinks();
    });

    $scope.$watch('vm.sortBy', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      this.loadDashboards();
    });

    $scope.$watch('vm.viewMode', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      setTimeout(() => {
        this.updateReadMoreLinks();
      });
    });

    $scope.$watch('vm.dashboards', (newValue, oldValue) => {
      if (newValue === oldValue) {
        return;
      }

      setTimeout(() => {
        this.updateReadMoreLinks();
      });
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
    this.dashboards.forEach(d => d.rotation = 0);
  }

  updateReadMoreLinks() {
    // Show "Read More" links for descriptions that overflow.
    $(`.dashboard-item-description`).each(function() {
      const $this = $(this);
      const $p = $this.find('p');
      if ($p.height() > $this.height()) {
        $this.find('.read-more').addClass('show');
      } else {
        $this.find('.read-more').removeClass('show');
      }
    });
  }

  get isAddSelectedButtonDisabled() {
    return (this.selectedDashboardCount === 0);
  }

  get selectedDashboardCount() {
    return Object.keys(this.selectedDashboards).length
  }

  readMoreClick(e, dashboard) {
    e.preventDefault();
    e.stopPropagation();

    // TODO
    this.flipDashboard(e, dashboard);
  }

  flipDashboard(e, dashboard) {
    const $item = $(`#dashboardItem${dashboard.htmlId} .dashboard-item-inner`);
    const itemRect = $item[0].getBoundingClientRect();
    const itemMid = itemRect.top + itemRect.height / 2;

    dashboard.rotation += (e.clientY < itemMid) ? 180 : -180;
    dashboard.isFlipped = !dashboard.isFlipped;

    $item.css({ transform: `rotateX(${dashboard.rotation}deg)` });
  }

  isDashboardSelected(dashboard) {
    return !!this.selectedDashboards[dashboard._id];
  }

  handleDashboardItemClick(e, dashboard) {
    if (dashboard.isFlipped) {
      this.flipDashboard(e, dashboard);
    } else {
      this.toggleSelectDashboard(dashboard);
    }
  }

  handleDashboardItemMouseLeave(e, dashboard) {
    if (dashboard.isFlipped) {
      this.flipDashboard(e, dashboard);
    }
  }

  toggleSelectDashboard(dashboard) {
    if (this.selectedDashboards[dashboard._id]) {
      delete this.selectedDashboards[dashboard._id];
    } else {
      this.selectedDashboards[dashboard._id] = dashboard;
    }
  }

  searchChange() {
    console.log('search')
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
      this.onConfirm({ selectedDashboards: this.selectedDashboards });
    }
  }
}

export default angular.module('addDashboardsOverlay', [viewMode])
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
