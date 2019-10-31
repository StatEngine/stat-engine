import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment-timezone';
import { NotFoundError } from '../../util/error';

export function getShift(req, res) {
  let fd = req.fireDepartment;
  const ShiftConfiguration = FirecaresLookup[fd.firecares_id];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();

    res.json({ shift: shiftly.calculateShift(moment.tz(fd.timezone).format()) });
  }
  else throw new NotFoundError('Shift configuration not found')
}
