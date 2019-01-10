import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment-timezone';

export function getShift(req, res) {
  let fd = req.fireDepartment;
  const ShiftConfiguration = FirecaresLookup[fd.firecares_id];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();

    res.json({ shift: shiftly.calculateShift(moment.tz(fd.timezone).format()) });
  }
  else res.send(500);
}