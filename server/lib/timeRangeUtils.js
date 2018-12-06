import moment from 'moment';
import { FirecaresLookup } from '@statengine/shiftly';

function _getShiftTimeFrame(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.shiftTimeFrame(date);
  }
}

export function calculateTimeRange(options) {
  console.dir(options)
  let startDate = options.startDate;
  let endDate = options.endDate;
  let timeUnit = options.timeUnit.toLowerCase();

  let shift = false;
  if (timeUnit === 'shift') {
    shift = true;
    timeUnit = 'day';
  }

  if(!endDate) {
    if(options.previous) {
      startDate = moment.parseZone(startDate).subtract(1, timeUnit);
    } else {
      startDate = moment.parseZone(startDate);
    }

    if(shift) {
      let shiftTimeFrame = _getShiftTimeFrame(options.firecaresId, startDate.format());
      startDate = shiftTimeFrame.start;
      endDate = shiftTimeFrame.end;
    } else {
      endDate = moment.parseZone(startDate.format()).endOf(timeUnit)
        .format();
      startDate = moment.parseZone(startDate.format()).startOf(timeUnit)
        .format();
    }
  }
  if(!endDate) throw new Error('Could not determine endDate');

  return {
    start: startDate,
    end: endDate,
  };
}