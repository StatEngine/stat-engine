'use strict';

import angular from 'angular';
import _ from 'lodash';
import moment from 'moment';

import TimelineChart from 'd3-timeline-chart/dist/timeline-chart.js';

export default angular.module('statEngineApp.timeline', [])
  .directive('timeline', function() {
    return {
      restrict: 'A',
      scope: {
        incident: '<',
      },
      link: (scope, element, attrs) => {

        const data = [];
        _.forEach(scope.incident.apparatus, u => {
          const unitData = {
            label: u.unit_id,
            data: [],
          };

          _.forOwn(u.unit_status, (status, key) => {
            unitData.data.push({
              type: TimelineChart.TYPE.POINT,
              at: moment(status.timestamp).toDate(),
            })
          })

          const dispatched = _.get(u, 'unit_status.dispatched.timestamp');
          const enroute = _.get(u, 'unit_status.enroute.timestamp');
          const arrived = _.get(u, 'unit_status.arrived.timestamp');

          if (dispatched && enroute) {
            unitData.data.push({
              type: TimelineChart.TYPE.INTERVAL,
              from: moment(dispatched).toDate(),
              to: moment(enroute).toDate(),
              customClass: 'blue-interval'
            })
          }
          if (enroute && arrived) {
            unitData.data.push({
              type: TimelineChart.TYPE.INTERVAL,
              from: moment(enroute).toDate(),
              to: moment(arrived).toDate(),
              customClass: 'yellow-interval'
            })
          }

          data.push(unitData);
        });

        /*
        const data = [{
            label: 'Name',
            data: [{
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 1, 1])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 2, 1])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 3, 1])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 4, 1])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 5, 1]),
                customClass: 'blue-dot'

            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 6, 1]),
                customClass: 'blue-dot'
            }]
        }, {
            label: 'Type',
            data: [{
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 1, 11])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 1, 15])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 3, 10])
            }, {
                label: 'I\'m a label with a custom class',
                type: TimelineChart.TYPE.INTERVAL,
                from: new Date([2015, 2, 1]),
                to: new Date([2015, 3, 1]),
                customClass: 'blue-interval'
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 6, 1])
            }, {
                type: TimelineChart.TYPE.POINT,
                at: new Date([2015, 7, 1])
            }]
        }, {
            label: 'Imp',
            data: [{
                label: 'Label 1',
                type: TimelineChart.TYPE.INTERVAL,
                from: new Date([2015, 1, 15]),
                to: new Date([2015, 3, 1])
            }, {
                label: 'Label 2',
                type: TimelineChart.TYPE.INTERVAL,
                from: new Date([2015, 4, 1]),
                to: new Date([2015, 5, 12])
            }]
        }];*/
        const timeline = new TimelineChart(element[0], data);
      }
    };
  })
  .name;
