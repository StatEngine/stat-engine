/* eslint  class-methods-use-this: 0 */

'use strict';

import { FirecaresLookup } from '@statengine/shiftly';

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
    let shift = this.shiftly.calculateShift(cell.date).toUpperCase();

    cell.cssClass = this.shiftClasses[shift].cellClass;
  };
}
