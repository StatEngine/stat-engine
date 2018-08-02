'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import * as vis from 'vis/dist/vis.js';

const TIME_FORMAT = 'HH:mm:ss';

export default class IncidentTimelineComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  $onInit() {
    const items = [];
    const groups = [];

    groups.push({
      id: 'Alarm',
      content: '<b>Alarm</b>'
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
      group: 'Alarm',
      title: `PSAP Answer at ${moment(psapAnswer).tz(this.timezone).format(TIME_FORMAT)}`,
      className: 'point',
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
      const alarmAnswer = moment.duration(moment(eventOpened).diff(moment(psapAnswer)))
      items.push({
        id: 'alarmAnswering',
        start: psapAnswer,
        align: 'bottom',
        end: eventOpened,
        type: 'range',
        group: 'Alarm',
        className: 'alarm-answering-duration',
        title: '<b>Alarm Answer in ' + humanizeDuration(alarmAnswer) + 's</b>',
        // content: '<i class="fa fa-phone"></i>'
      });
    }

    if (firstUnitDispatched && eventOpened) {
      const alarmProcessing = moment.duration(moment(firstUnitDispatched).diff(moment(eventOpened)))
      items.push({
        id: 'alarmProcessing',
        start: eventOpened,
        align: 'bottom',
        end: firstUnitDispatched,
        type: 'range',
        group: 'Alarm',
        className: 'alarm-processing-duration',
        title: '<b>Alarm Processing in ' + humanizeDuration(alarmProcessing) + 's</b>',
        // content: '<i class="fa fa-exchange"></i>'
      });
    }

    if (eventOpened) items.push({
      id: 'eventOpened',
      content: '',
      type: 'point',
      start: eventOpened,
      group: 'Alarm',
      title: `Event Opened at ${moment(eventOpened).tz(this.timezone).format(TIME_FORMAT)}`,
      className: 'point',
    });

    if (eventClosed) items.push({
      id: 'eventClosed',
      content: '',
      type: 'point',
      start: eventClosed,
      group: 'Alarm',
      title: `Event Closed at ${moment(eventClosed).tz(this.timezone).format(TIME_FORMAT)}`,
      className: 'point',
    });

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

      const clearedTimestamps = [];
      _.forEach(['available','in_quarters','available_radio','avaiable_mobile','cleared'],
        prop => {
          let t = _.get(u, `unit_status.${prop}.timestamp`);
          if (t) clearedTimestamps.push(t);
        }
      );

      let cleared = _.minBy(clearedTimestamps, t => moment(t.timestamp).valueOf());

      if (arrived && cleared) {
        const eventDuration = moment.duration(moment(cleared).diff(moment(arrived)))
        items.push({
          id: u.unit_id + 'intervention',
          start: arrived,
          end: cleared,
          type: 'range',
          group: u.unit_id,
          className: 'unit-event-duration',
          title: '<b> Intervention for ' + humanizeDuration(eventDuration) + '</b>',
          // content: this.incident.isFireIncident() ? '<i class="fa fa-free-code-camp"></i>' : '<i class="fa fa-medkit"></i>'
        });
      }

      if (!arrived && (dispatched || enroute)) {
        let start;
        if (enroute) start = enroute;
        else start = dispatched;

        const cancelledDuration = moment.duration(moment(cleared).diff(moment(start)))
        items.push({
          id: u.unit_id + 'Cancelled',
          start: start,
          end: cleared,
          type: 'range',
          group: u.unit_id,
          className: 'unit-cancelled-duration',
          title: '<b> Out-of-service (cancelled) for ' + humanizeDuration(cancelledDuration) + '</b>',
          // content: '<i class="fa fa-ban"></i>'
        });
      }

      if (dispatched && enroute) {
        const turnoutDuration = moment.duration(moment(enroute).diff(moment(dispatched)))
        items.push({
          id: u.unit_id + 'turnout',
          start: dispatched,
          align: 'bottom',
          end: enroute,
          type: 'range',
          group: u.unit_id,
          className: 'unit-turnout-duration',
          title: '<b>Turnout in ' + humanizeDuration(turnoutDuration) + '</b>',
          // content: '<i class="fa fa-spinner text-center"></i>'
        });
      }

      if (enroute && arrived) {
        const turnoutDuration = moment.duration(moment(arrived).diff(moment(enroute)))
        items.push({
          id: u.unit_id + 'travel',
          start: enroute,
          end: arrived,
          type: 'range',
          group: u.unit_id,
          className: 'unit-travel-duration',
          title: '<b>Travel in ' + humanizeDuration(turnoutDuration) + '</b>',
          // content: '<i class="fa fa-map-o"></i>'
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
          title: `${statusName} at ${moment(status.timestamp).tz(this.timezone).format(TIME_FORMAT)}`,
          className: 'point',
        });
      });
    });

    const timezone = this.timezone;
    const options = {
      stack: false,
      start: moment(eventOpened).subtract(2, 'minutes'),
      end: moment(eventClosed).add(2, 'minutes'),
      // 1 day
      zoomMax: 86400000,
      // 1 minute
      zoomMin: 60000,
      selectable: false,
      moment: function(date) {
        return moment(date).tz(timezone);
     }
    };

   this.element = angular.element(document.querySelector('#incident-timeline'));
   const container = document.getElementById('mytimeline');
   const timeline = new vis.Timeline(this.element[0], items, groups, options);
  }
}
