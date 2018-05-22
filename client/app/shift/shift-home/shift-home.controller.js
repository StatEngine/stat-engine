/* eslint  class-methods-use-this: 0 */

'use strict';

import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment';
import _ from 'lodash';

export default class ShiftHomeController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, stats) {
    this.SegmentService = SegmentService;

    this.calendarView = 'month';
    this.stats = stats;

    this.statsTableOptions = {
      data: this.stats.shifts,
      minRowsToShow: this.stats.shifts.length,
      enableVerticalScrollbar: 0,
      columnDefs: [{
        field: 'name',
        width: 70,
        displayName: 'Shift'
      }, {
        field: 'turnoutDuration90_lastWeek',
        cellFilter: 'number: 2',
        displayName: 'Week'
      }, {
        field: 'turnoutDuration90_lastMonth',
        cellFilter: 'number: 2',
        displayName: 'Month'
      }, {
        field: 'turnoutDuration90_lastQuarter',
        cellFilter: 'number: 2',
        displayName: 'Quarter'
      }, {
        field: 'turnoutDuration90_lastYear',
        cellFilter: 'number: 2',
        displayName: 'Year'
      }]
    };

    const ShiftConfiguration = FirecaresLookup[currentPrincipal.FireDepartment.firecares_id];
    this.shiftly = new ShiftConfiguration();

    const uniqueShifts = _.uniq(this.shiftly.pattern.split(''));
    this.shiftClasses = {};

    let i = 0;
    uniqueShifts.forEach(shift => {
      this.shiftClasses[shift.toUpperCase()] = {
        name: shift.toUpperCase(),
        cellClass: `shift-${i}`,
        legendClass: `legend-${i}`,
      };
      ++i;
    });

    this.events = [];

    this.today = moment().tz(currentPrincipal.FireDepartment.timezone);
    this.today.set('hour', this.shiftly.shiftStart.substring(0, 2));
    this.today.set('minutes', this.shiftly.shiftStart.substring(2, 4));
    this.todaysShift = {
      date: this.today.format('ddd, MM-DD'),
      shift: this.shiftly.calculateShift(this.today).toUpperCase(),
    };

    this.upcomingShifts = [];
    let start = moment(this.today);
    for(let j = 0; j < 10; j += 1) {
      start = start.add(1, 'days');
      this.upcomingShifts.push({
        date: start.format('ddd, MM-DD'),
        shift: this.shiftly.calculateShift(start).toUpperCase(),
      });
    }
  }

  cellModifier(cell) {
    const thisDate = moment(cell.date);
    thisDate.set('hour', this.shiftly.shiftStart.substring(0, 2));
    thisDate.set('minutes', this.shiftly.shiftStart.substring(2, 4));

    let shift = this.shiftly.calculateShift(thisDate).toUpperCase();

    cell.cssClass = this.shiftClasses[shift].cellClass;
  }
}
