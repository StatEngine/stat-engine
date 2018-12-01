'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { getApparatusTimeData } from '../helpers/timelineUtils';

let _;
let Timeline;

const TIME_FORMAT = 'HH:mm:ss';

export default class IncidentApparatusTimelineComponent {
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

    const timezone = this.timezone;

    let orderedResponses = _.orderBy(this.responses, 'apparatus_data.extended_data.event_duration', 'desc');
    orderedResponses = orderedResponses.slice(0,99);
    let order = 1;
    _.forEach(orderedResponses, response => {
      let group = response.description.incident_number;
      groups.push({
        id: group,
        content: `<a href="https://statengine.io/incidents/${response.description.incident_number}">${response.description.incident_number}</a>`,
        order: order++,
      });

      const u = response.apparatus_data;
      const appTimelineData = getApparatusTimeData(u);
      const dispatched = _.get(response, 'apparatus_data.unit_status.dispatched.timestamp');

      if (dispatched) {
        _.forEach(appTimelineData.durations, d => {
          const start = moment(d.start).diff(moment(dispatched));
          // normalize start times
          items.push({
            id: `${group}-${u.unit_id}-${d.name}`,
            start: new Date(start),
            end: new Date(start + d.duration),
            group,
            type: 'range',
            className: `unit-${d.name}-duration`,
            title: `<b>${d.displayName} for ${humanizeDuration(d.duration)}</b>`,
          });
        });
      }
    });

    // Configuration for the Timeline
    var options = {
      selectable: false,
      stack: false,
      verticalScroll: true,
      maxHeight: 500,
      zoomable: false,
      start: new Date(0),
      min: new Date(0),
      format: {
        minorLabels: (date, scale, step) => {
          var epoch = new Date(0);
          var duration = date - epoch;
          var divider;
          switch (scale) {
            case 'millisecond':
              divider = 1;
              break;
            case 'second':
              divider = 1000;
              break;
            case 'minute':
              divider = 1000 * 60;
              break;
            case 'hour':
              divider = 1000 * 60 * 60;
              break;
            case 'day':
              divider = 1000 * 60 * 60 * 24;
              break;
            case 'weekday':
              divider = 1000 * 60 * 60 * 24 * 7;
              break;
            case 'month':
              divider = 1000 * 60 * 60 * 24 * 30;
              break;
            case 'year':
              divider = 1000 * 60 * 60 * 24 * 365;
              break;
            default:
              return new Date(date);
          } 
          return  (Math.round(duration * step / divider)) + "m" 
        },
        majorLabels: function(date, scale, step) {
          var epoch = new Date(0);
          var duration = date - epoch;
          var divider;
          switch (scale) {
            case 'millisecond':
              divider = 1;
              break;
            case 'second':
              divider = 1000;
              break;
            case 'minute':
              divider = 1000 * 60;
              break;
            case 'hour':
              divider = 1000 * 60 * 60;
              break;
            case 'day':
              divider = 1000 * 60 * 60 * 24;
              break;
            case 'weekday':
              divider = 1000 * 60 * 60 * 24 * 7;
              break;
            case 'month':
              divider = 1000 * 60 * 60 * 24 * 30;
              break;
            case 'year':
              divider = 1000 * 60 * 60 * 24 * 365;
              break;
            default:
              return new Date(date);
          } 
          return  (Math.round(duration * step / divider)) + "m" 
        }
      }
    };
    
    this.element = angular.element(document.querySelector('#incident-apparatus-timeline'));
    // eslint-disable-next-line
    let timeline = new Timeline(this.element[0], items, groups, options);
  }
}
