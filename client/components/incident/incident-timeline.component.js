'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';

import * as vis from 'vis/dist/vis.js';

export default class IncidentTimelineComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  turnoutClassName(duration) {
    let fire = (_.get(this.incident, 'description.category') === 'FIRE');

    let className = 'turnout-green';
    if (fire && duration > 90) className = 'turnout-red';
    if (!fire && duration > 60)  className = 'turnout-red';

    return className;
  }

  $onInit() {
    const items = [];
    const groups = [];

    const eventOpened = _.get(this.incident, 'description.event_opened');
    const eventClosed = _.get(this.incident, 'description.event_closed');

    _.each(this.incident.apparatus, (u) => {
      // define groupe
      groups.push({
        id: u.unit_id,
        content: u.unit_id,
      });

      // each timestamp
      _.forOwn(u.unit_status, (status, statusName) => {
        if (status.timestamp) items.push({
          id: u.unit_id + statusName,
          content: '',
          start: status.timestamp,
          type: 'point',
          group: u.unit_id,
          title: `${statusName} at ${status.timestamp}`,
          className: statusName,
        });
      });

      // define interesting timeframes
      const dispatched = _.get(u, 'unit_status.dispatched.timestamp');
      const enroute = _.get(u, 'unit_status.enroute.timestamp');
      const arrived = _.get(u, 'unit_status.arrived.timestamp');

      if (dispatched && enroute) {
        items.push({
          id: u.unit_id + 'turnout',
          content: '<b>Turnout</b>',
          start: dispatched,
          align: 'bottom',
          end: enroute,
          type: 'background',
          group: u.unit_id,
          className: this.turnoutClassName(moment.duration(moment(enroute).diff(dispatched)).asSeconds()),
        });
      }

      if (enroute && arrived) {
        items.push({
          id: u.unit_id + 'travel',
          content: '<b>Travel</b>',
          start: enroute,
          end: arrived,
          type: 'background',
          group: u.unit_id,
          className: 'travel',
        });
      }
    });

    const options = {
      stack: false,
      start: eventOpened,
      end: eventClosed,
      // 1 day
      zoomMax: 86400000,
      // 1 minute
      zoomMin: 60000,
    };

   this.element = angular.element(document.querySelector('#incident-timeline'));
   const container = document.getElementById('mytimeline');
   const timeline = new vis.Timeline(this.element[0], items, groups, options);
  }
}
