import _ from 'lodash';
import moment from 'moment';
import { IncidentRule, GRADES } from '../../incident-rule';
import humanizeDuration from 'humanize-duration';

export default class FirstEngineArrival extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.threshold = 240;

    this.description = 'First engine should have a 4 minute travel time or less.';
  }

  applicable() {
    return this.incident.isFireIncident();
  }

  getEvidence() {
    const evidence = [];

    const engineTravelTime = this.incident.firstEngineTravelSeconds;
    const firstEngineArrived = this.incident.firstEngineUnitArrived;

    let grade = GRADES.SUCCESS;
    if (!firstEngineArrived) {
      evidence.push({
        text: `No engine arrived on scene.`,
        grade: GRADES.DANGER
      });
    } else {
      if (engineTravelTime > this.threshold) grade = GRADES.DANGER;
      evidence.push({
        text: `First engine, ${firstEngineArrived.unit_id} had a travel time of ${humanizeDuration(engineTravelTime * 1000, {delimiter: ' and '})}.`,
        grade: grade
      });
    }
    return evidence;
  }
}
