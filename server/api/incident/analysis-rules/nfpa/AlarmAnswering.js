import _ from 'lodash';
import moment from 'moment';
import { IncidentRule, GRADES } from '../../incident-rule';

export default class AlarmAnswering extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.warningThreshold = 15;
    this.dangerThreshold = 40;

    this.description = `Alarm answering should be less than ${this.warningThreshold} seconds, 95% of time`;
  }

  applicable() {
    return true;
  }

  getEvidence() {
    const evidence = [];

    const alarmAnswerTime = this.incident.alarmAnsweringDurationSeconds;
    let grade = GRADES.SUCCESS;
    if (alarmAnswerTime > this.warningThreshold) grade = GRADES.WARNING;
    if (alarmAnswerTime > this.dangerThreshold) {
      grade = GRADES.DANGER;
      this.description = `Alarm answering should be less than ${this.dangerThreshold} seconds, 99% of time`;
    }

    evidence.push({
      text: `Alarm answering time was ${alarmAnswerTime} seconds.`,
      grade: grade
    });

    return evidence;
  }
}
