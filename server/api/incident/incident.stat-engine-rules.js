import _ from 'lodash';
import moment from 'moment';

const GRADES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};

function topLevelGrade(evidence) {
  let grade = GRADES.success;

  if (_.filter(evidence, e => e.grade === GRADES.DANGER).length > 0) return GRADES.DANGER;
  else if (_.filter(evidence, e => e.grade === GRADES.WARNING).length > 0) return GRADES.WARNING;

  else return GRADES.SUCCESS;
}

class IncidentRule {
  constructor(incident){
    this.name = this.constructor.name
    this.incident = incident;
  }

  get category() {
    return _.get(this.incident, 'description.category');
  }

  get apparatus() {
    return _.get(this.incident, 'apparatus');
  }

  grade() {
    if (!this.applicable()) return;

    const evidence = this.getEvidence();
    return {
      name: this.name,
      description: this.description,
      grade: topLevelGrade(evidence),
      evidence: evidence,
    }
  }
}

export class FireTurnout90 extends IncidentRule {
  constructor(incident) {
    super(incident);
    this.description = 'Unit turnout should be less than 90 seconds';
  }

  applicable() {
    return this.category === 'FIRE' && this.apparatus && this.apparatus.length > 0
  }

  getEvidence() {
    const evidence = [];
    _.forEach(this.apparatus, u => {
      const turnout = _.get(u, 'extended_data.turnout_duration');
      if (turnout) {
        let grade = GRADES.SUCCESS;
        if (this.category === 'FIRE' && turnout > 90) grade = GRADES.DANGER;
        else if (this.category !== 'FIRE' && turnout > 60) grade = GRADES.DANGER;
        evidence.push({
          text: `${u.unit_id} turnout time was ${turnout} seconds.`,
          grade
        });
      }
    });

    return evidence;
  }
}

export class FirstDue extends IncidentRule {
  constructor(incident) {
    super(incident);
    this.description = 'First due unit should arrive on-scene first';
  }

  applicable() {
    return this.apparatus && this.apparatus.length > 0
  }

  getEvidence() {
    const evidence = [];
    const firstDue = _.find(this.apparatus, u => u.first_due);
    const firstArrived = _.find(this.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);

    const firstDueArrivedTimestamp = firstDue ? _.get(firstDue, 'unit_status.arrived.timestamp'): undefined;
    const firstArrivedTimestamp = firstArrived ? _.get(firstArrived, 'unit_status.arrived.timestamp'): undefined;

    if (!firstDue) {
      evidence.push({
        text: `Could not determine first due unit`,
        grade: GRADES.DANGER,
      });
    } else if (!firstArrived) {
      evidence.push({
        text: `Could not determine first arrived unit`,
        grade: GRADES.DANGER,
      });
    } else if (!firstDueArrivedTimestamp) {
      evidence.push({
        text: `First due, ${firstDue.unit_id} never arrived on scene`,
        grade: GRADES.DANGER,
      });
    } else if (firstDue.unit_id !== firstArrived.unit_id) {
      const difference = moment.duration(moment(firstDueArrivedTimestamp).diff(moment(firstArrivedTimestamp)));
      const diffText = difference.as('seconds') > 60 ? `${difference.as('minutes')} minutes` : `${difference.as('seconds')} seconds`
      evidence.push({
        text: `First due, ${firstDue.unit_id}, ${firstDue.unit_id}, arrived ${diffText} later than first due unit`,
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
