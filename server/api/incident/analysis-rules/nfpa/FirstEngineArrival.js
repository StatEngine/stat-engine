import _ from 'lodash';
import moment from 'moment';
import { IncidentRule, GRADES } from '../../incident-rule';

export default class FirstEngineArrival extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.threshold = 240;

    this.description = `First engine should arrive on within 4 minutes`;
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
        text: `First engine, ${firstEngineArrived.unit_id} arrived in ${(engineTravelTime/60).toFixed(2)} minutes.`,
        grade: grade
      });
    }
    return evidence;
  }
}
