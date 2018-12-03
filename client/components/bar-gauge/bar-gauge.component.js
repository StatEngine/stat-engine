'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import _ from 'lodash';
import percentile from 'percentile';

export class BarGaugeComponent {
  constructor($element, $attrs) {
    'ngInject';
    this.element = $element[0];
    this.needle = $(this.element.querySelector('.bar-gauge-needle-group'));
    this.midLabel = $(this.element.querySelector('.bar-guage-mid'));
    this.duration = !_.isUndefined($attrs.duration);
    this.percentileElements = $(this.element.querySelectorAll('.bar-gauge > div'));
  }

  $onInit() {
    this.min = _.min(this.data);
    this.max = _.max(this.data);

    this.totalPercentiles = [20, 40, 60, 80, 90].map(percent => percentile(percent, this.data));

    var ranges = _.reduce(this.totalPercentiles, (acc, p, i) => {
      let res = [];
      if(i == 0) {
        res = [this.min, p];
      } else if(i === this.totalPercentiles.length - 1) {
        res = [this.totalPercentiles[i - 1] + 1, this.max];
      } else {
        res = [this.totalPercentiles[i - 1] + 1, p];
      }
      acc.push(res);
      return acc;
    }, []);

    var quartile = _.findIndex(ranges, range => this.value >= range[0] && this.value <= range[1]);

    this.lowValue = ranges[0][1];
    this.midRange = [ranges[1][0], ranges[3][1]];
    this.highValue = ranges[4][0];
    this.category = quartile === 0 ? this.minLabel : quartile === 4 ? this.maxLabel : 'Typical';

    this.metricTitle = this.metricTitle || 'Count';
    this.total = _.sumBy(this.data, n => n.count);
    this.midLabel.css({'margin-left': -this.midLabel.width });

    var percentileElement = $(this.percentileElements[quartile]);

    // console.log(`
    // QuartileElementStart: ${parseInt(percentileElement.css('left'))}
    // QuartileElementEnd: ${parseInt(percentileElement.width())}
    // value: ${this.value}
    // quartileMin: ${ranges[quartile][0]},
    // quartileMax: ${ranges[quartile][1]},
    // percent: ${(this.value - ranges[quartile][0]) / (ranges[quartile][1] - ranges[quartile][0]) || 0}
    // left: ${parseInt(percentileElement.css('left')) + ((this.value - ranges[quartile][0]) / (ranges[quartile][1] - ranges[quartile][0]) || 0) * (percentileElement.width() - 3)}
    // `);
    this.needle.css({left: parseInt(percentileElement.css('left')) + ((this.value - ranges[quartile][0]) / (ranges[quartile][1] - ranges[quartile][0]) || 0) * (percentileElement.width() - 3) + 'px'});
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
      average: '<',
      maxLabel: '@',
      minLabel: '@',
      percentiles: '<',
      data: '<'
    },
  })
  .name;
