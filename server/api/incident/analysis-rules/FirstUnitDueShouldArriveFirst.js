import moment from 'moment-timezone';
import humanizeDuration from 'humanize-duration';

import { IncidentRule, GRADES } from '../incident-rule';

export default class FirstUnitDueShouldArriveFirst extends IncidentRule {
  constructor(incident) {
    super(incident);
    this.description = 'First due unit should arrive on-scene first';
    this.category = 'StatEngine';
  }

  applicable() {
    return this.incident.hasApparatus();
  }

  getEvidence() {
    const evidence = [];

    const firstDue = this.incident.firstUnitDue;
    const firstDueArrivalTime = this.incident.firstUnitDueArrivalTime;

    const firstArrived = this.incident.firstUnitArrived;
    const firstUnitArrivedArrivalTime = this.incident.firstUnitArrivedArrivalTime;

    if(!firstDue) {
      evidence.push({
        text: 'Could not determine first due unit',
        grade: GRADES.DANGER,
      });
    } else if(!firstArrived) {
      evidence.push({
        text: 'Could not determine first arrived unit',
        grade: GRADES.DANGER,
      });
    } else if(!firstDueArrivalTime) {
      evidence.push({
        text: `First due, ${firstDue.unit_id} never arrived on scene`,
        grade: GRADES.DANGER,
      });
    } else if(firstDue.unit_id !== firstArrived.unit_id) {
      const difference = moment.duration(moment(firstDueArrivalTime).diff(moment(firstUnitArrivedArrivalTime)));
      evidence.push({
        text: `First due, ${firstDue.unit_id}, arrived ${humanizeDuration(difference.as('milliseconds'), {delimiter: ' and '})} later than ${firstArrived.unit_id}`,
        grade: GRADES.DANGER,
      });
    } else {
      evidence.push({
        text: `First due unit, ${firstDue.unit_id} arrived on scene first.`,
        grade: GRADES.SUCCESS,
      });
    }

    return evidence;
  }
}
