'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { getApparatusTimeData } from '../helpers/timelineUtils';

let _;
let Timeline;

export default class IncidentApparatusTimelineComponent {
  initialized = false;

  constructor($window) {
    'ngInject';

    this.$window = $window;

    this.$window.addEventListener('resize', () => {
      if(this.timeline != null) {
        this.timeline.redraw();
      }
    });
  }

  async loadModules() {
    const mod = await import(/* webpackChunkName: "vis" */ 'vis/dist/vis.js');
    Timeline = mod.Timeline;
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
  }

  async $onInit() {
    await this.loadModules();

    this.updateTimeline();

    this.initialized = true;
  }

  $onDestroy() {
    if(this.timeline) {
      this.timeline.destroy();
    }
  }

  async $onChanges() {
    if(!this.initialized) {
      return
    }

    this.updateTimeline();
  }

  async updateTimeline() {
    const items = [];
    const groups = [];

    let orderedResponses = this.responses.slice(0, 99);
    let order = 1;
    _.forEach(orderedResponses, response => {
      let group = response.description.incident_number;
      groups.push({
        id: group,
        content: `<a href="/incidents/${response.description.incident_number}">${response.description.incident_number}</a>`,
        order: order++,
      });

      const u = response.apparatus_data;
      const appTimelineData = getApparatusTimeData(u);
      const dispatched = _.get(response, 'apparatus_data.unit_status.dispatched.timestamp');

      if(dispatched) {
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

    if(this.timeline) {
      // Update timeline.
      this.timeline.setData({
        items,
        groups,
      });
      this.timeline.redraw();
    } else {
      // HACK: If we don't have any data, don't create the table yet. This fixes an issue where the table
      // won't update with new data after initializing without any data.
      if(groups.length === 0) {
        return;
      }

      // Create timeline.
      const options = {
        selectable: false,
        stack: false,
        verticalScroll: true,
        height: '100%',
        maxHeight: '100%',
        zoomable: false,
        start: new Date(0),
        min: new Date(0),
        format: {
          minorLabels: (date, scale, step) => {
            const epoch = new Date(0);
            const duration = date - epoch;
            let divider;
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
            return `${Math.round(duration * step / divider)}m`;
          },
          majorLabels: (date, scale, step) => {
            const epoch = new Date(0);
            const duration = date - epoch;
            let divider;
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
            return `${Math.round(duration * step / divider)}m`;
          }
        }
      };

      this.element = angular.element(document.querySelector('#apparatus-timeline'));
      this.timeline = new Timeline(this.element[0], items, groups, options);
    }
  }
}
