'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { getApparatusTimeData } from '../helpers/timelineUtils';

let _;
let Timeline;

const TIME_FORMAT = 'HH:mm:ss';

export default class IncidentTimelineComponent {
  incident;
  timezone;

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
      id: 'Incident',
      content: '<b>Incident</b>',
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
        group: 'Incident',
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
        group: 'Incident',
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
        group: 'Incident',
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
        group: 'Incident',
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
        group: 'Incident',
        // eslint-disable-next-line
        title: `Event Closed at ${moment(eventClosed).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const airMonitoringCompleted = _.get(this.incident, 'description.air_monitoring_completed');
    if(airMonitoringCompleted) {
      items.push({
        id: 'airMonitoringCompleted',
        content: '',
        type: 'point',
        start: airMonitoringCompleted,
        group: 'Incident',
        title: `Air Monitoring Completed at ${moment(airMonitoringCompleted).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      })
    }

    const commandEstablished = _.get(this.incident, 'description.command_established');
    if(commandEstablished) {
      items.push({
        id: 'commandEstablished',
        content: '',
        type: 'point',
        start: commandEstablished,
        group: 'Incident',
        title: `Command Established at ${moment(commandEstablished).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const lossStopped = _.get(this.incident, 'description.loss_stopped');
    if(lossStopped) {
      items.push({
        id: 'lossStopped',
        content: '',
        type: 'point',
        start: lossStopped,
        group: 'Incident',
        title: `Loss Stopped at ${moment(lossStopped).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const primarySearchCompleted = _.get(this.incident, 'description.primary_search_completed');
    if(primarySearchCompleted) {
      items.push({
        id: 'primarySearchCompleted',
        content: '',
        type: 'point',
        start: primarySearchCompleted,
        group: 'Incident',
        title: `Primary Search Completed at ${moment(primarySearchCompleted).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const rehabEstablished = _.get(this.incident, 'description.rehab_established');
    if(rehabEstablished) {
      items.push({
        id: 'rehabEstablished',
        content: '',
        type: 'point',
        start: rehabEstablished,
        group: 'Incident',
        title: `Rehab Established at ${moment(rehabEstablished).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const ricEstablished = _.get(this.incident, 'description.ric_established');
    if(ricEstablished) {
      items.push({
        id: 'ricEstablished',
        content: '',
        type: 'point',
        start: ricEstablished,
        group: 'Incident',
        title: `RIC Established at ${moment(ricEstablished).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const secondarySearchCompleted = _.get(this.incident, 'description.secondary_search_completed');
    if(secondarySearchCompleted) {
      items.push({
        id: 'secondarySearchCompleted',
        content: '',
        type: 'point',
        start: secondarySearchCompleted,
        group: 'Incident',
        title: `Secondary Search Completed at ${moment(secondarySearchCompleted).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const waterOnFire = _.get(this.incident, 'description.water_on_fire');
    if(waterOnFire) {
      items.push({
        id: 'waterOnFire',
        content: '',
        type: 'point',
        start: waterOnFire,
        group: 'Incident',
        title: `Water On Fire at ${moment(waterOnFire).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const walkAroundCompleted = _.get(this.incident, 'description.walk_around_completed');
    if(walkAroundCompleted) {
      items.push({
        id: 'walkAroundCompleted',
        content: '',
        type: 'point',
        start: walkAroundCompleted,
        group: 'Incident',
        title: `Walk Around Completed at ${moment(walkAroundCompleted).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const utilitiesSecured = _.get(this.incident, 'description.utilities_secured');
    if(utilitiesSecured) {
      items.push({
        id: 'utilitiesSecured',
        content: '',
        type: 'point',
        start: utilitiesSecured,
        group: 'Incident',
        title: `Utilities Secured at ${moment(utilitiesSecured).tz(this.timezone).format(TIME_FORMAT)}`,
        className: 'point',
      });
    }

    const fireWatchInitiated = _.get(this.incident, 'description.fire_watch_initiated');
    if(fireWatchInitiated) {
      items.push({
        id: 'fireWatchInitiated',
        content: '',
        type: 'point',
        start: fireWatchInitiated,
        group: 'Incident',
        title: `Fire Watch Initiated at ${moment(fireWatchInitiated).tz(this.timezone).format(TIME_FORMAT)}`,
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
          const displayName = _.startCase(statusName) || statusName;
          items.push({
            id: `${u.unit_id}-${statusName}`,
            content: '',
            start: status.timestamp,
            type: 'point',
            group: u.unit_id,
            // eslint-disable-next-line
            title: `${displayName} at ${moment(status.timestamp).tz(this.timezone).format(TIME_FORMAT)}`,
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
      format: {
        minorLabels: {
          millisecond: 'SSS',
          second: 's',
          minute: 'HH:mm',
          hour: 'HH:mm',
          weekday: 'ddd D',
          day: 'D',
          week: 'w',
          month: 'MMM',
          year: 'YYYY'
        },
        majorLabels: {
          millisecond: 'HH:mm:ss',
          second: 'D MMMM HH:mm',
          minute: 'ddd D MMMM',
          hour: 'ddd D MMMM',
          weekday: 'MMMM YYYY',
          day: 'MMMM YYYY',
          week: 'MMMM YYYY',
          month: 'YYYY',
          year: ''
        }
      }
    };

    this.element = angular.element(document.querySelector('#incident-timeline'));
    // eslint-disable-next-line
    this.timeline = new Timeline(this.element[0], items, groups, options);
  }

  $onDestory() {
    if(this.timeline) this.timeline.destroy();
  }
}
