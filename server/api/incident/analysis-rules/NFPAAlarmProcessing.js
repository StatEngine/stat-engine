import { IncidentRule, GRADES } from '../incident-rule';

export default class AlarmProcessing extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.warningThreshold = 64;
    this.dangerThreshold = 106;
    this.category = 'NFPA';

    this.description = `Alarm processing should be less than ${this.warningThreshold} seconds, 90% of time`;
  }

  getEvidence() {
    const evidence = [];

    const alarmProcessingTime = this.incident.alarmProcessingDurationSeconds;
    let grade = GRADES.SUCCESS;
    if(alarmProcessingTime > this.warningThreshold) grade = GRADES.WARNING;
    if(alarmProcessingTime > this.dangerThreshold) {
      grade = GRADES.DANGER;
      this.description = `Alarm processing should be less than ${this.dangerThreshold} seconds, 95% of time`;
    }

    evidence.push({
      text: `Alarm processing time was ${alarmProcessingTime} seconds.`,
      grade
    });

    return evidence;
  }
}
