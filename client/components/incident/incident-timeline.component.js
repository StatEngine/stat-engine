'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';
import { Timeline } from 'vis/dist/vis.js';

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
      content: '<b>Alarm</b>',
      order: 1,
    });

    const psapAnswer = _.get(this.incident, 'description.psap_answer_time');
    const firstUnitDispatched = _.get(this.incident, 'description.first_unit_dispatched');
    const eventOpened = _.get(this.incident, 'description.event_opened');
    const eventClosed = _.get(this.incident, 'description.event_closed');

    if(psapAnswer) {
      items.push({
        id: 'psapAnswer',
        content: '',
        type: 'point',
        start: psapAnswer,
        group: 'Alarm',
        // eslint-disable-next-line
        title: `PSAP Answer at ${moment(psapAnswer).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    if(eventOpened && eventClosed) {
      items.push({
        id: 'totalEvent',
        content: '<b>Event</b>',
        start: eventOpened,
        align: 'center',
        end: eventClosed,
        type: 'background',
        className: 'event-duration'
      });
    }

    if(psapAnswer && eventOpened) {
      const alarmAnswer = moment.duration(moment(eventOpened).diff(moment(psapAnswer)));
      items.push({
        id: 'alarmAnswering',
        start: psapAnswer,
        align: 'bottom',
        end: eventOpened,
        type: 'range',
        group: 'Alarm',
        className: 'alarm-answering-duration',
        title: `<b>Alarm Answer in ${humanizeDuration(alarmAnswer)}</b>`,
      });
    }

    if(firstUnitDispatched && eventOpened) {
      const alarmProcessing = moment.duration(moment(firstUnitDispatched).diff(moment(eventOpened)));
      items.push({
        id: 'alarmProcessing',
        start: eventOpened,
        align: 'bottom',
        end: firstUnitDispatched,
        type: 'range',
        group: 'Alarm',
        className: 'alarm-processing-duration',
        title: `<b>Alarm Processing in ${humanizeDuration(alarmProcessing)}</b>`,
      });
    }

    if(eventOpened) {
      items.push({
        id: 'eventOpened',
        content: '',
        type: 'point',
        start: eventOpened,
        group: 'Alarm',
        // eslint-disable-next-line
        title: `Event Opened at ${moment(eventOpened).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    if(eventClosed) {
      items.push({
        id: 'eventClosed',
        content: '',
        type: 'point',
        start: eventClosed,
        group: 'Alarm',
        // eslint-disable-next-line
        title: `Event Closed at ${moment(eventClosed).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const apparatus = _.orderBy(this.incident.apparatus, u => {
      let dispatched = _.get(u, 'unit_status.dispatched.timestamp');
      if(dispatched) return moment(dispatched).valueOf();
    });
    let order = 2;
    _.each(apparatus, u => {
      // define groupe
      groups.push({
        id: u.unit_id,
        content: `<b>${u.unit_id}</b>`,
        order: order++,
      });

      // define interesting timeframes
      const dispatched = _.get(u, 'unit_status.dispatched.timestamp');
      const enroute = _.get(u, 'unit_status.enroute.timestamp');
      const arrived = _.get(u, 'unit_status.arrived.timestamp');
      const transportStarted = _.get(u, 'unit_status.transport_started.timestamp');
      const transportArrived = _.get(u, 'unit_status.transport_arrived.timestamp');

      const leftSceneTimestamps = [];
      _.forEach(
        ['transport_started', 'available', 'in_quarters', 'available_radio', 'available_mobile', 'cleared'],
        prop => {
          let t = _.get(u, `unit_status.${prop}.timestamp`);
          if(t) leftSceneTimestamps.push(t);
        }
      );
      let leftScene = _.minBy(leftSceneTimestamps, t => moment(t).valueOf());

      const clearedTimestamps = [];
      _.forEach(
        ['available', 'in_quarters', 'available_radio', 'available_mobile', 'cleared'],
        prop => {
          let t = _.get(u, `unit_status.${prop}.timestamp`);
          if(t) clearedTimestamps.push(t);
        }
      );

      const avilableTimestamps = [];
      _.forEach(
        ['available', 'in_quarters', 'available_radio', 'available_mobile'],
        prop => {
          let t = _.get(u, `unit_status.${prop}.timestamp`);
          if(t) avilableTimestamps.push(t);
        }
      );

      let cleared = _.minBy(clearedTimestamps, t => moment(t).valueOf());
      let available = _.minBy(avilableTimestamps, t => moment(t).valueOf());

      if(arrived && leftScene) {
        const onSceneDuration = moment.duration(moment(leftScene).diff(moment(arrived)));
        items.push({
          id: `${u.unit_id}onscene`,
          start: arrived,
          end: leftScene,
          type: 'range',
          group: u.unit_id,
          className: 'unit-intervention-duration',
          title: `<b>On scene for ${humanizeDuration(onSceneDuration)}</b>`,
        });
      }

      if(transportStarted && transportArrived) {
        const transportDuration = moment.duration(moment(transportArrived).diff(moment(arrived)));
        items.push({
          id: `${u.unit_id}transport`,
          start: transportStarted,
          end: transportArrived,
          type: 'range',
          group: u.unit_id,
          className: 'unit-transport-duration',
          title: `<b> Transport for ${humanizeDuration(transportDuration)}</b>`,
        });
      }

      if(transportArrived && cleared) {
        const postTransportDuration = moment.duration(moment(cleared).diff(moment(transportArrived)));
        items.push({
          id: `${u.unit_id}post-transport`,
          start: transportArrived,
          end: cleared,
          type: 'range',
          group: u.unit_id,
          className: 'unit-post-transport-duration',
          title: `<b> Post Transport for ${humanizeDuration(postTransportDuration)}</b>`,
        });
      } else if(cleared && available) {
        const postClearedDuration = moment.duration(moment(cleared).diff(moment(available)));
        if(postClearedDuration > 0) {
          items.push({
            id: `${u.unit_id}post-incident`,
            start: cleared,
            end: available,
            type: 'range',
            group: u.unit_id,
            className: 'unit-post-incident-duration',
            title: `<b> Post Incident for ${humanizeDuration(postClearedDuration)}</b>`,
          });
        }
      }

      if(!arrived && (dispatched || enroute)) {
        let start;
        if(enroute) start = enroute;
        else start = dispatched;

        const cancelledDuration = moment.duration(moment(leftScene).diff(moment(start)));
        items.push({
          id: `${u.unit_id}cancelled`,
          start,
          end: leftScene || start,
          type: 'range',
          group: u.unit_id,
          className: 'unit-cancelled-duration',
          title: `<b> Out-of-service (cancelled) for ${humanizeDuration(cancelledDuration)}</b>`,
        });
      }

      if(dispatched && enroute) {
        const turnoutDuration = moment.duration(moment(enroute).diff(moment(dispatched)));
        items.push({
          id: `${u.unit_id}turnout`,
          start: dispatched,
          align: 'bottom',
          end: enroute,
          type: 'range',
          group: u.unit_id,
          className: 'unit-turnout-duration',
          title: `<b>Turnout in ${humanizeDuration(turnoutDuration)}</b>`,
        });
      }

      if(enroute && arrived) {
        const turnoutDuration = moment.duration(moment(arrived).diff(moment(enroute)));
        items.push({
          id: `${u.unit_id}travel`,
          start: enroute,
          end: arrived,
          type: 'range',
          group: u.unit_id,
          className: 'unit-travel-duration',
          title: `<b>Travel in ${humanizeDuration(turnoutDuration)}</b>`,
        });
      }

      // each timestamp
      _.forOwn(u.unit_status, (status, statusName) => {
        if(status.timestamp) {
          items.push({
            id: `${u.unit_id}${statusName}`,
            content: '',
            start: status.timestamp,
            type: 'point',
            group: u.unit_id,
            // eslint-disable-next-line
            title: `${statusName} at ${moment(status.timestamp).tz(this.timezone).format(TIME_FORMAT)}`,
            className: 'point',
          });
        }
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
      moment: date => moment(date).tz(timezone),
    };

    this.element = angular.element(document.querySelector('#incident-timeline'));
    // eslint-disable-next-line
    let timeline = new Timeline(this.element[0], items, groups, options);
  }
}
