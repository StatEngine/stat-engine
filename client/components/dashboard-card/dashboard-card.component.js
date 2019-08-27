'use strict';

import angular from 'angular';

export class DashboardCard {
  dashboard;
  isSelected;
  viewMode;
  onClick;
  rotation = 0;
  isFlipped = false;

  /*@ngInject*/
  constructor($scope, $window, $element) {
    this.$element = $element;

    $window.addEventListener('resize', () => {
      this.updateReadMore();
    });
  }

  $onChanges() {
    setTimeout(() => {
      this.updateReadMore();
    });
  }

  handleClick(e) {
    if (this.isFlipped) {
      this.flip(e);
    } else {
      if (this.onClick) {
        this.onClick({ dashboard: this.dashboard });
      }
    }
  }

  flip(e) {
    const $inner = this.$element.find('.dashboard-card-inner');
    const innerRect = $inner[0].getBoundingClientRect();
    const innerMid = innerRect.top + innerRect.height / 2;

    this.rotation += (e.clientY < innerMid) ? 180 : -180;
    this.isFlipped = !this.isFlipped;

    $inner.css({ transform: `rotateX(${this.rotation}deg)` });
  }

  updateReadMore() {
    // Show "Read More" link for descriptions that overflow.
    const $frontDesc = this.$element.find(`.dashboard-card-front .dashboard-card-description`);
    const $readMore = $frontDesc.find('.read-more');
    if ($frontDesc.find('p').height() > $frontDesc.height()) {
      $readMore.addClass('show');
    } else {
      $readMore.removeClass('show');
    }
  }

  readMoreClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.flip(e);
  }
}

export default angular.module('dashboardCard', [])
  .component('dashboardCard', {
    template: require('./dashboard-card.html'),
    controller: DashboardCard,
    controllerAs: 'vm',
    bindings: {
      dashboard: '<',
      isSelected: '<',
      viewMode: '<',
      onClick: '&',
    },
  })
  .name;
