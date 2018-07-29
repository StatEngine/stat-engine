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

    this.timezone = currentPrincipal.FireDepartment.timezone;

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

    if (ShiftConfiguration) {
      this.shiftly = new ShiftConfiguration();

      const uniqueShifts = _.uniq(this.shiftly.pattern.split('')).sort();
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

      this.today = moment().tz(this.timezone);
      this.today.set('hour', this.shiftly.shiftStart.substring(0, 2));
      this.today.set('minutes', this.shiftly.shiftStart.substring(2, 4));
      this.todaysShift = {
        date: this.today.format('ddd, MM-DD'),
        shift: this._calculateShift(this.today),
      };

      this.upcomingShifts = [];
      let start = moment(this.today).tz(this.timezone);
      for(let j = 0; j < 10; j += 1) {
        start = start.add(1, 'days');
        this.upcomingShifts.push({
          date: start.format('ddd, MM-DD'),
          shift: this._calculateShift(start),
        });
      }  
    }
  }

  _calculateShift(date) {
    return this.shiftly.calculateShift(date.format()).toUpperCase();
  }

  cellModifier(cell) {
    const thisDate = moment(cell.date).tz(this.timezone);
    thisDate.set('hour', this.shiftly.shiftStart.substring(0, 2));
    thisDate.set('minutes', this.shiftly.shiftStart.substring(2, 4));

    let shift = this._calculateShift(thisDate);

    cell.cssClass = this.shiftClasses[shift].cellClass;
  }
}
