/* eslint  class-methods-use-this: 0 */

'use strict';

import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment';

export default class ShiftHomeController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal) {
    this.SegmentService = SegmentService;

    this.calendarView = 'month';

    const ShiftConfiguration = FirecaresLookup[currentPrincipal.FireDepartment.firecares_id]
    this.shiftly = new ShiftConfiguration();

    const uniqueShifts = _.uniq(this.shiftly.pattern.split(''));
    this.shiftClasses = {};

    let i = 0;
    uniqueShifts.forEach(shift => {
      this.shiftClasses[shift.toUpperCase()] = {
        name: shift.toUpperCase(),
        cellClass: `shift-${i}`,
        legendClass: `legend-${i}`,
      }
      ++i;
    });

    this.events = [];

    this.today = moment().tz(currentPrincipal.FireDepartment.timezone);
    this.today.set('hour', this.shiftly.shiftStart.substring(0, 2));
    this.today.set('minutes', this.shiftly.shiftStart.substring(2, 4));

    this.yesterday = moment(this.today).subtract(1, 'day');
    this.tomorrow = moment(this.today).add(1, 'day');

    this.importantShifts = {
      today: {
        text: this.today.format('MM-DD-YYYY'),
        shift: this.shiftly.calculateShift(this.today).toUpperCase(),
      },
      yesterday: {
        text: this.yesterday.format('MM-DD-YYYY'),
        shift: this.shiftly.calculateShift(this.yesterday).toUpperCase(),
      },
      tomorrow: {
        text: this.tomorrow.format('MM-DD-YYYY'),
        shift: this.shiftly.calculateShift(this.tomorrow).toUpperCase(),
      }
    }
  }

  cellModifier = function(cell) {
    const thisDate = moment(cell.date);
    thisDate.set('hour', this.shiftly.shiftStart.substring(0, 2));
    thisDate.set('minutes', this.shiftly.shiftStart.substring(2, 4));

    let shift = this.shiftly.calculateShift(thisDate).toUpperCase();

    cell.cssClass = this.shiftClasses[shift].cellClass;
  };
}
