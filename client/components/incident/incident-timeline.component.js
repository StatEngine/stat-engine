'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';

import TimelineChart from 'd3-timeline-chart/dist/timeline-chart.js';

export default class IncidentTimelineComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  drawTimeline() {
    if (this.element) {
      this.element.empty();
      const timeline = new TimelineChart(this.element[0], this.data);
    }
  }

  $onInit() {
    this.data = [];
    _.forEach(this.incident.apparatus, u => {
      const unitData = {
        label: u.unit_id,
        data: [],
      };

      _.forOwn(u.unit_status, (status, key) => {
        unitData.data.push({
          type: TimelineChart.TYPE.POINT,
          at: moment(status.timestamp).toDate(),
        })
      })

      const dispatched = _.get(u, 'unit_status.dispatched.timestamp');
      const enroute = _.get(u, 'unit_status.enroute.timestamp');
      const arrived = _.get(u, 'unit_status.arrived.timestamp');

      if (dispatched && enroute) {
        unitData.data.push({
          type: TimelineChart.TYPE.INTERVAL,
          from: moment(dispatched).toDate(),
          to: moment(enroute).toDate(),
          customClass: 'blue-interval'
        })
      }
      if (enroute && arrived) {
        unitData.data.push({
          type: TimelineChart.TYPE.INTERVAL,
          from: moment(enroute).toDate(),
          to: moment(arrived).toDate(),
          customClass: 'yellow-interval'
        })
      }

      this.data.push(unitData);
    });

    this.element = angular.element(document.querySelector('#incident-timeline'));
    this.$window.addEventListener('resize', this.drawTimeline.bind(this));
    this.drawTimeline()
  }

  $onDestroy() {
    this.$window.removeEventListener('resize', this.drawTimeline.bind(this));
  }
}
