import { FirecaresLookup } from '@statengine/shiftly';

export function getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];
  if (ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
  return '';
}

export function getShiftTimeRange(firecaresId, date) {
  console.log('GET SHIFT TIME RANGE');
  const ShiftConfiguration = FirecaresLookup[firecaresId];
  if (ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.shiftTimeFrame(date);
  }
  return '';
}
