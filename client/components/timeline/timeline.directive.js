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

        const timeline = new TimelineChart(element[0], data);
      }
    };
  })
  .name;
