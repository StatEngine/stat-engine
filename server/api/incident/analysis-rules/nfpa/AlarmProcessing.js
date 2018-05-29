import _ from 'lodash';
import moment from 'moment';
import { IncidentRule, GRADES } from '../../incident-rule';

export default class AlarmProcessing extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.warningThreshold = 64;
    this.dangerThreshold = 106;

    this.description = `Alarm processing should be less than ${this.warningThreshold} seconds, 90% of time`;
  }

  applicable() {
    return true;
  }

  getEvidence() {
    const evidence = [];

    const alarmProcessingTime = this.incident.alarmProcessingTimeSeconds;
    let grade = GRADES.SUCCESS;
    if (alarmProcessingTime > this.warningThreshold) grade = GRADES.WARNING;
    if (alarmProcessingTime > this.dangerThreshold) {
      grade = GRADES.DANGER;
      this.description = `Alarm processing should be less than ${this.dangerThreshold} seconds, 95% of time`;
    }

    evidence.push({
      text: `Alarm processing time was ${alarmProcessingTime} seconds.`,
      grade: grade
    });

    return evidence;
  }
}
