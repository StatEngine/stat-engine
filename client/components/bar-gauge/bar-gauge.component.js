'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';
import percentile from 'percentile';

export class BarGaugeComponent {
  value;
  min;
  max;
  maxLabel;
  minLabel;
  data;
  needleGroupStyle = {
    visibility: 'visible',
  };
  needleContainerStyle = {
    left: 0,
  };
  needleTextStyle = {
    transform: undefined,
  };
  initialized = false;

  constructor($element, $timeout) {
    'ngInject';

    this.element = $element;
    this.needleTextElement = angular.element(this.element[0].querySelector('.needle-text'));
    this.$timeout = $timeout;
  }

  $onInit() {
    this.updateGauge();

    this.initialized = true;
  }

  $onChanges() {
    if(!this.initialized) {
      return;
    }

    this.updateGauge();
  }

  updateGauge() {
    this.isDuration = (!_.isUndefined(this.isDuration)) ? this.isDuration : false;

    this.min = _.min(this.data);
    this.max = _.max(this.data);

    this.totalPercentiles = [20, 40, 60, 80, 90].map(percent => percentile(percent, this.data));

    const ranges = _.reduce(this.totalPercentiles, (acc, p, i) => {
      let res = [];
      if(i === 0) {
        res = [this.min, p];
      } else if(i === this.totalPercentiles.length - 1) {
        res = [this.totalPercentiles[i - 1] + 1, this.max];
      } else {
        res = [this.totalPercentiles[i - 1] + 1, p];
      }
      acc.push(res);
      return acc;
    }, []);

    const quartile = _.findIndex(ranges, range => this.value >= range[0] && this.value <= range[1]);

    this.lowValue = ranges[0][1];
    this.midRange = [ranges[1][0], ranges[3][1]];
    this.highValue = ranges[4][0];
    this.category = quartile === 0 ? this.minLabel : quartile === 4 ? this.maxLabel : 'Typical';

    this.metricTitle = this.metricTitle || 'Count';
    this.total = _.sumBy(this.data, n => n.count);

    let valuePercent = 0;
    if(ranges[quartile]) {
      valuePercent = (this.value - ranges[quartile][0]) / (ranges[quartile][1] - ranges[quartile][0]) || 0;
      valuePercent *= 100;
      this.needleGroupStyle.visibility = 'visible';
    } else {
      this.needleGroupStyle.visibility = 'hidden';
    }

    this.needleContainerStyle.left = `${valuePercent}%`;

    // On render...
    this.$timeout(() => {
      // Keep the needle text within the element bounds.
      const elementBounds = this.element[0].getBoundingClientRect();
      const needleTextElementBounds = this.needleTextElement[0].getBoundingClientRect();
      const needleTextHalfWidth = needleTextElementBounds.width / 2;
      const needleContainerX = elementBounds.width * (valuePercent / 100);
      const needleTextMinX = needleContainerX - needleTextHalfWidth;
      const needleTextMaxX = needleContainerX + needleTextHalfWidth;

      const offset = 10;
      if(needleTextMinX < 0) {
        this.needleTextStyle.transform = `translateX(${-needleTextMinX - offset}px)`;
      } else if(needleTextMaxX > elementBounds.width) {
        this.needleTextStyle.transform = `translateX(${-(needleTextMaxX - elementBounds.width) + offset}px)`;
      } else {
        this.needleTextStyle.transform = 'translateX(0)';
      }
    });
  }
}

export default angular.module('directives.barGauge', [])
  .component('barGauge', {
    template: require('./bar-gauge.html'),
    controller: BarGaugeComponent,
    controllerAs: 'vm',
    bindings: {
      value: '<',
      min: '<',
      max: '<',
      maxLabel: '@',
      minLabel: '@',
      data: '<',
      isDuration: '<'
    },
  })
  .name;
