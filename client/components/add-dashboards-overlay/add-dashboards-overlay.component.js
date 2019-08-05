'use strict';

import angular from 'angular';
import viewMode from '../view-mode/view-mode.component';

export class AddDashboardsOverlay {
  show;
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
  constructor($scope, $window, Modal) {
    this.Modal = Modal;

    $window.addEventListener('resize', () => {
      this.updateReadMoreLinks();
    });

    $scope.$watch('vm.sortBy', () => {
      this.loadDashboards();
    });

    $scope.$watch('vm.viewMode', () => {
      setTimeout(() => {
        this.updateReadMoreLinks();
      });
    });

    $scope.$watch('vm.dashboards', () => {
      setTimeout(() => {
        this.updateReadMoreLinks();
      });
    });

    $scope.$watch('vm.show', () => {
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
    // TODO: Load real dashboards...
    setTimeout(() => {
      this.dashboards = [];
      for (let i = 0; i < 10; i++) {
        this.dashboards.push({
          id: i,
          title: 'Dashboard Title Dashboard Title Dashboard Title Dashboard Title Dashboard Title',
          author: 'Bobby Ross Jr.',
          description: 'Dashboard descruption praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae msan porttitor, facilisis luctus, metus. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah. Dashboard descruption blah blah blah blah blah.',
          category: 'Accreditation',
          downloads: 22,
          version: '1.4',
          rotation: 0,
        })
      }
    }, 1000);
  }

  updateReadMoreLinks() {
    // Show "Read More" links for descriptions that overflow.
    $(`.dashboard-item-description`).each(function() {
      const $this = $(this);
      const $p = $this.find('p');
      const opacity = ($p.height() > $this.height()) ? 1 : 0;
      $this.find('.read-more').css({ opacity });
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
    const $item = $(`#dashboardItem${dashboard.id} .dashboard-item-inner`);
    const itemRect = $item[0].getBoundingClientRect();
    const itemMid = itemRect.top + itemRect.height / 2;

    dashboard.rotation += (e.clientY < itemMid) ? 180 : -180;
    dashboard.isFlipped = !dashboard.isFlipped;

    $item.css({ transform: `rotateX(${dashboard.rotation}deg)` });
  }

  isDashboardSelected(dashboard) {
    return !!this.selectedDashboards[dashboard.id];
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
    if (this.selectedDashboards[dashboard.id]) {
      delete this.selectedDashboards[dashboard.id];
    } else {
      this.selectedDashboards[dashboard.id] = dashboard;
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
}

export default angular.module('addDashboardsOverlay', [viewMode])
  .component('addDashboardsOverlay', {
    template: require('./add-dashboards-overlay.html'),
    controller: AddDashboardsOverlay,
    controllerAs: 'vm',
    bindings: {
      show: '=',
    },
  })
  .name;
