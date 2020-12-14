import later from '@breejs/later';
import moment from 'moment';

import TimerStore from '../scheduling/timer-store';
import { queryFindAll as listCustomEmails } from '../../api/custom-email/custom-email.controller';
import Watcher from '../scheduling/actions/watcher';

// schedule everything in UTC
later.date.UTC();

export default class CustomEmailScheduler {
  // -- Static props and methods
  static customEmailTimers = new TimerStore();

  static generateEmailSchedule(emailData) {
    const sched = later.parse.text(emailData.schedule);
    console.log('SCHEDULE OBJECT');
    console.dir(sched, { depth: null });
    const deptId = emailData.fd_id;
    if (this.shouldAddAnHour(deptId) && sched.schedules[0].t) {
      sched.schedules[0].t = this.addAnHour(sched);
    }
    return sched;
  }

  static async scheduleCustomEmail(emailData) {
    console.log('scheduleCustomEmails');
    console.dir(this.customEmailTimers);
    this.customEmailTimers.removeInterval(emailData._id);
    const watcher = new Watcher('customEmail', emailData);
    const laterSchedule = this.generateEmailSchedule(emailData);
    const interval = later.setInterval(watcher.execute.bind(watcher), laterSchedule);
    this.customEmailTimers.addInterval(emailData._id, interval);
  }

  static unscheduleEmail(emailData) {
    this.customEmailTimers.removeInterval(emailData._id);
  }

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
    // first get all the customEmails
    const where = {
      enabled: true,
    };
    const enabledEmails = await listCustomEmails(where);
    console.log('scheduleCustomEmails');
    console.dir(enabledEmails);

    enabledEmails.forEach(emailData => {
      // make a later schedule for the email
      this.scheduleCustomEmail(emailData);
    });
  }
}
