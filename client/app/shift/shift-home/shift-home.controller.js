/* eslint  class-methods-use-this: 0 */

'use strict';

import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment';

export default class ShiftHomeController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal) {
    this.SegmentService = SegmentService;

    this.calendarView = 'month';
    this.viewDate = new Date()

    const ShiftConfiguration = FirecaresLookup[currentPrincipal.FireDepartment.firecares_id]
    this.shiftly = new ShiftConfiguration();

    const uniqueShifts = _.uniq(this.shiftly.pattern.split(''));
    this.shiftClasses = {};

    console.dir(this.shiftly)
    let i = 0;
    uniqueShifts.forEach(shift => {
      this.shiftClasses[shift.toUpperCase()] = {
        name: shift.toUpperCase(),
        cellClass: `shift-${i}`,
        legendClass: `legend-${i}`,
      }
      ++i;
    });
  }

  cellModifier = function(cell) {
    const thisDate = moment(cell.date);
    thisDate.set('hour', this.shiftly.shiftStart.substring(0, 2));
    thisDate.set('minutes', this.shiftly.shiftStart.substring(2, 4));

    let shift = this.shiftly.calculateShift(thisDate).toUpperCase();

    cell.cssClass = this.shiftClasses[shift].cellClass;
  };
}
