'use strict';

import angular from 'angular';
import humanizeDuration from 'humanize-duration';
import moment from 'moment-timezone';
import { getApparatusTimeData } from '../helpers/timelineUtils';

let _;
let Timeline;

export default class IncidentApparatusTimelineComponent {
  initialized = false;
  hammers = [];
  sort = 'incident_number';

  constructor($window) {
    'ngInject';

    this.$window = $window;

    this.$window.addEventListener('resize', () => {
      this.redraw();
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

    // Cleanup touch gesture managers.
    this.hammers.forEach(hammer => {
      hammer.destroy();
    });
    this.hammers = [];
  }

  async $onChanges() {
    if(!this.initialized) {
      return
    }

    this.updateTimeline();
  }

  sortByIncidentNumber(a, b) {
    return 0;
  }

  sortByResponseTime(a, b) {
    const first = a.apparatus_data.extended_data.event_duration;
    const second = b.apparatus_data.extended_data.event_duration;

    if (first < second) {
      return 1;
    } else if (first > second) {
      return -1;
    } else {
      return 0;
    }
  }

  async updateTimeline() {
    const items = [];
    const groups = [];
    const sortFn = this.sort === 'incident_number' ? this.sortByIncidentNumber : this.sortByResponseTime;

    let orderedResponses = this.responses
    .slice(0, 99)
    .sort(sortFn);
    
    let order = 1;
    _.forEach(orderedResponses, response => {
      let group = response.description.incident_number;
      groups.push({
        id: group,
        content: `<a class="timeline-incident-link" href="/incidents/${response.description.incident_number}">${response.description.incident_number}</a>`,
        order: order++,
      });

      const u = response.apparatus_data;
      const appTimelineData = getApparatusTimeData(u);
      const dispatched = _.get(response, 'apparatus_data.unit_status.dispatched.timestamp');

      if  (dispatched) {
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
      this.redraw();
    } else {
      // HACK: If we don't have any data, don't create the table yet. This fixes an issue where the table
      // won't update with new data after initializing without any data.
      if(groups.length === 0) {
        return;
      }

      this.element = angular.element(document.querySelector('#apparatus-timeline'));
      const height = angular.element(document.querySelector('#apparatus-timeline-container'))[0].offsetHeight;

      // Create timeline.
      this.options = {
        selectable: false,
        stack: false,
        verticalScroll: true,
        height: `${height}px`,
        maxHeight: `${height}px`,
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

      this.timeline = new Timeline(this.element[0], items, groups, this.options);

      // Respond to incident link taps on mobile.
      const self = this;
      for(const element of $('.timeline-incident-link')) {
        const hammer = new Hammer(element).on('tap', function(e) {
          self.$window.location = $(e.target).attr('href');
        });
        this.hammers.push(hammer);
      }
    }
  }

  redraw() {
    if (!this.timeline) {
      return;
    }

    // HACK: For some reason setting a height/maxHeight of 100% doesn't work on mobile (the timeline
    // overflows its container). So set the timeline height manually when redrawing.
    const element = angular.element(document.querySelector('#apparatus-timeline-container'));
    const height = element[0].offsetHeight;
    this.options.height = `${height}px`;
    this.options.maxHeight = `${height}px`;
    this.timeline.setOptions(this.options);
    this.timeline.redraw();
  }
}
