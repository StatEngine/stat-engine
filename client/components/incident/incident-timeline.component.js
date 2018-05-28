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

  $onInit() {
    const items = [];
    const groups = [];

    groups.push({
      id: 'Event',
      content: '<b>Event</b>'
    });

    const psapAnswer = _.get(this.incident, 'description.psap_answer_time');
    const firstUnitDispatched = _.get(this.incident, 'description.first_unit_dispatched');
    const eventOpened = _.get(this.incident, 'description.event_opened');
    const eventClosed = _.get(this.incident, 'description.event_closed');

    if (psapAnswer) items.push({
      id: 'psapAnswer',
      content: '',
      type: 'point',
      start: psapAnswer,
      group: 'Event',
      title: `PSAP Answer at ${psapAnswer}`,
    });

    if (eventOpened) items.push({
      id: 'eventOpened',
      content: '',
      type: 'point',
      start: eventOpened,
      group: 'Event',
      title: `Event Opened at ${eventOpened}`,
    });

    if (eventClosed) items.push({
      id: 'eventClosed',
      content: '',
      type: 'point',
      start: eventClosed,
      group: 'Event',
      title: `Event Closed at ${eventClosed}`,
    });

    if (eventOpened && eventClosed) items.push({
      id: 'totalEvent',
      content: '<b>Event</b>',
      start: eventOpened,
      align: 'center',
      end: eventClosed,
      type: 'background',
      className: 'event-duration'
    });

    if (psapAnswer && eventOpened) {
      const alarmAnswer = moment.duration(moment(eventOpened).diff(moment(psapAnswer))).as('seconds')
      items.push({
        id: 'alarmAnswering',
        start: psapAnswer,
        align: 'bottom',
        end: eventOpened,
        type: 'range',
        group: 'Event',
        className: 'alarm-answering-duration',
        title: '<b>Alarm Answer in ' + alarmAnswer + 's</b>'
      });
    }

    if (firstUnitDispatched && eventOpened) {
      const alarmProcessing = moment.duration(moment(firstUnitDispatched).diff(moment(eventOpened))).as('seconds')
      items.push({
        id: 'alarmProcessing',
        start: eventOpened,
        align: 'bottom',
        end: firstUnitDispatched,
        type: 'range',
        group: 'Event',
        className: 'alarm-processing-duration',
        title: '<b>Alarm Processing in ' + alarmProcessing + 's</b>'
      });
    }

    _.each(this.incident.apparatus, (u) => {
      // define groupe
      groups.push({
        id: u.unit_id,
        content: '<b>' + u.unit_id + '</b>',
      });

      // define interesting timeframes
      const dispatched = _.get(u, 'unit_status.dispatched.timestamp');
      const enroute = _.get(u, 'unit_status.enroute.timestamp');
      const arrived = _.get(u, 'unit_status.arrived.timestamp');

      if (dispatched && enroute) {
        const turnoutDuration = moment.duration(moment(enroute).diff(moment(dispatched))).as('seconds')
        items.push({
          id: u.unit_id + 'turnout',
          start: dispatched,
          align: 'bottom',
          end: enroute,
          type: 'range',
          group: u.unit_id,
          className: 'turnout-duration',
          title: '<b>Turnout in ' + turnoutDuration + 's</b>'
        });
      }

      if (enroute && arrived) {
        const turnoutDuration = moment.duration(moment(arrived).diff(moment(enroute))).as('seconds')
        items.push({
          id: u.unit_id + 'travel',
          start: enroute,
          end: arrived,
          type: 'range',
          group: u.unit_id,
          className: 'travel',
          title: '<b>Travel in ' + turnoutDuration + 's</b>'
        });
      }

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
    });

    const options = {
      stack: false,
      start: moment(eventOpened).subtract(2, 'minutes'),
      end: moment(eventClosed).add(2, 'minutes'),
      // 1 day
      zoomMax: 86400000,
      // 1 minute
      zoomMin: 60000,
      selectable: false,
    };

   this.element = angular.element(document.querySelector('#incident-timeline'));
   const container = document.getElementById('mytimeline');
   const timeline = new vis.Timeline(this.element[0], items, groups, options);
  }
}
