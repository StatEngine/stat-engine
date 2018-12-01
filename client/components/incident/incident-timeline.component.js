'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { getApparatusTimeData } from '../helpers/timelineUtils';

let _;
let Timeline;

const TIME_FORMAT = 'HH:mm:ss';

export default class IncidentTimelineComponent {
  constructor($window) {
    'ngInject';

    this.$window = $window;
  }

  async loadModules() {
    const mod = await import(/* webpackChunkName: "vis" */ 'vis/dist/vis.js');
    Timeline = mod.Timeline;
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

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
      // define group
      groups.push({
        id: u.unit_id,
        content: `<b>${u.unit_id}</b>`,
        order: order++,
      });

      const appTimelineData = getApparatusTimeData(u);

      _.forEach(appTimelineData.durations, d => {
        items.push({
          id: `${u.unit_id}-${d.name}`,
          start: d.start,
          end: d.end,
          type: 'range',
          group: u.unit_id,
          className: `unit-${d.name}-duration`,
          title: `<b>${d.displayName} for ${humanizeDuration(d.duration)}</b>`,
        });
      });

      // each timestamp
      _.forOwn(u.unit_status, (status, statusName) => {
        if(status.timestamp) {
          items.push({
            id: `${u.unit_id}-${statusName}`,
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
