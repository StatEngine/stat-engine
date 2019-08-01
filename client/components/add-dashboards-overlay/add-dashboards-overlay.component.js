'use strict';

import angular from 'angular';
import viewMode from '../view-mode/view-mode.component';

export class AddDashboardsOverlay {
  show;
  searchQuery = '';
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
  sortBy = this.sortByOptions[0].id;
  viewMode = 'grid';
  dashboards = [];
  selectedDashboards = {};

  /*@ngInject*/
  constructor($scope, $window) {
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
    })
  }

  $onInit() {
    this.loadDashboards();
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
          description: 'Dashboard descruption praesent dapibus, neque id cursus faucibus, tortor neque egestas auguae msan porttitor, facilisis luctus, metus. Dashboard descruption blah blah blah blah blah.',
          category: 'Accreditation',
          downloads: 22,
          version: '1.4',
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
    dashboard.isFlipped = true;
  }

  isDashboardSelected(dashboard) {
    return !!this.selectedDashboards[dashboard.id];
  }

  toggleSelectDashboard(dashboard) {
    if (this.selectedDashboards[dashboard.id]) {
      delete this.selectedDashboards[dashboard.id];
    } else {
      this.selectedDashboards[dashboard.id] = dashboard;
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
