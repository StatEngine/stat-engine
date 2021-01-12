import later from '@breejs/later';
import moment from 'moment';

import TimerStore from '../scheduling/timer-store';
import { queryFindAll as listCustomEmails } from '../../api/custom-email/custom-email.controller';
import Watcher from '../scheduling/actions/watcher';
import getFireDepartment from './fireDepartment';
import { getShiftTimeRange } from '../shift';

// schedule everything in UTC
later.date.UTC();

export default class CustomEmailScheduler {
  // -- Static props and methods
  static customEmailTimers = new TimerStore();

  static async getShiftSched(deptId) {
    const fireDepartment = await getFireDepartment(deptId);
    const { firecares_id: firecaresId } = fireDepartment;
    const shiftTimeRange = getShiftTimeRange(firecaresId, moment().format());
    const { start } = shiftTimeRange;
    // add an hour to allow the shift data to be ingested
    const time = moment(start).add(1, 'hour').format('h:mm a');
    const laterStr = `at ${time}`;
    return laterStr;
  }

  static async generateEmailSchedule(emailData) {
    let sched;
    const deptId = emailData.fd_id;

    if (emailData.by_shift) {
      const schedStr = await this.getShiftSched(deptId);
      sched = later.parse.text(schedStr);
    } else {
      sched = later.parse.text(emailData.schedule);
    }

    // handle Daylight Savings Time
    if (this.shouldAddAnHour(deptId) && sched.schedules[0].t) {
      sched.schedules[0].t = this.addAnHour(sched);
    }

    return sched;
  }

  static async scheduleCustomEmail(emailData) {
    this.customEmailTimers.removeInterval(emailData._id);
    const watcher = new Watcher('customEmail', emailData);
    const laterSchedule = await this.generateEmailSchedule(emailData);
    const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
    this.customEmailTimers.addInterval(emailData._id, interval);
  }

  static unscheduleEmail(emailId) {
    this.customEmailTimers.removeInterval(emailId);
  }

  // UTC does not account for DST hence the offset between US Eastern and UTC time changes
  // from -5hrs to -4 hrs during DST (approx March-Nov)
  // Hence, if it is not currently DST, then we need to add an hour offset to the schedule
  // since the clock has "fallen back". It is also important to remember that the times/schedules
  // specified in the DB configs assume a DST offset.
  // e.g.
  // Richmond wants emails at approx 8:00 am EST
  // Their config specifies approx 12:00 pm UTC
  // if DST is being observed this is fine and we don't need to do anything,
  // however if DST is NOT observed then the -5hrs offset kicks-in on Nov 1st
  // and the email would go out at approx 7 am EST, therefore we add an hour
  // to the time to make it go out at 8 am EST as desired.
  static addAnHour(sched) {
    let time = sched.schedules[0].t[0];
    // later uses seconds, not millisecondxs
    time += 3600;
    return [time];
  }

  static shouldAddAnHour(deptId) {
    // array of the departments that do not participate in
    // daylight savings time
    const nonDSTDepartments = [
      '82670', // Golder Ranch, AZ
      '90649', // Northwest AZ
      '93429', // Rincon Vallye, AZ
      '97477', // Tuscon, AZ
    ];

    // if a DST department && it is currently DST, then we need to offset the time (see comments for subtractAnHour method)
    return (nonDSTDepartments.findIndex(d => d === deptId) === -1 && moment().isDST() === false);
  }

  static async scheduleCustomEmails() {
    // now that the server is running, let's schedule the custom emails
    // first get all the enabled emails
    const where = { enabled: true };
    const enabledEmails = await listCustomEmails(where);
    enabledEmails.forEach(emailData => {
      this.scheduleCustomEmail(emailData);
    });
  }
}
