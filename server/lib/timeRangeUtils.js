import moment from 'moment-timezone';
import { FirecaresLookup } from '@statengine/shiftly';

function _getShiftTimeFrame(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.shiftTimeFrame(date);
  }
}

export function calculateTimeRange(options) {
  let startDate = options.startDate;
  let endDate = options.endDate;
  let timeUnit = options.timeUnit.toLowerCase();

  let shift = false;
  if(timeUnit === 'shift') {
    shift = true;
    timeUnit = 'day';
  }

  if(!endDate) {
    if(options.previous && options.previous !== 'false') {
      startDate = moment.parseZone(startDate).subtract(1, timeUnit);
    } else {
      startDate = moment.parseZone(startDate);
    }

    if(shift) {
      let shiftTimeFrame = _getShiftTimeFrame(options.firecaresId, startDate.format());

      if(shiftTimeFrame) {
        startDate = shiftTimeFrame.start;
        endDate = shiftTimeFrame.end;
      } else {
        endDate = moment.parseZone(startDate.format()).endOf('day')
          .format();
        startDate = moment.parseZone(startDate.format()).startOf('day')
          .format();
      }
    } else {
      startDate = moment.parseZone(startDate.format()).startOf('day')
        .format();
      endDate = moment.parseZone(startDate).add(1, timeUnit).format();
    }
  }
  if(!endDate) throw new Error('Could not determine endDate');

  return {
    start: startDate,
    end: endDate,
  };
}

export default calculateTimeRange;
