'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';
import Plotly from 'plotly.js';

import TimelineChart from 'd3-timeline-chart/dist/timeline-chart.js';

export default angular.module('statEngineApp.timeline', [])
  .directive('timeline', function() {
    return {
      restrict: 'A',
      scope: {
        incident: '<',
      },
      link: (scope, element, attrs) => {
        const apparatus = scope.incident.apparatus;
        var unitTimelineData = [];
        const turnoutDurations = {
          x: [],
          y: [],
        };
        const travelDurations = {
          x: [],
          y: [],
        };

        _.forEach(apparatus, u => {
          if (u.extended_data.turnout_duration) {
            turnoutDurations.x.push(u.extended_data.turnout_duration);
            turnoutDurations.y.push(u.unit_id);
          }
          if (u.extended_data.travel_duration) {
            travelDurations.x.push(u.extended_data.travel_duration);
            travelDurations.y.push(u.unit_id);
          }
        })

        unitTimelineData.push({
          x: turnoutDurations.x,
          y: turnoutDurations.y,
          name: 'Turnout',
          orientation: 'h',
          marker: {
            color: 'rgba(55,128,191,0.6)',
            width: 1
          },
          type: 'bar'
        });
        unitTimelineData.push({
          x: travelDurations.x,
          y: travelDurations.y,
          name: 'Travel',
          orientation: 'h',
          marker: {
            color: 'rgba(255,153,51,0.6)',
            width: 1
          },
          type: 'bar'
        });

        var layout = {
          title: 'Unit Response Durations',
          barmode: 'stack',
          shapes: [

            //line vertical

            {
              type: 'line',
              x0: 90,
              x1: 90,
              line: {
                color: 'red',
                width: 4
              }
            },
          ]
        };

        console.dir(unitTimelineData);
        console.dir(element);
        Plotly.newPlot(element[0], unitTimelineData, layout);
      }
    };
  })
  .name;
