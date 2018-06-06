import _ from 'lodash';

import { Incident } from './incident';

export const GRADES = {
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
};

function topLevelGrade(evidence) {
  if(_.filter(evidence, e => e.grade === GRADES.DANGER).length > 0) return GRADES.DANGER;
  else if(_.filter(evidence, e => e.grade === GRADES.WARNING).length > 0) return GRADES.WARNING;
  else return GRADES.SUCCESS;
}

export class IncidentRule {
  constructor(incident) {
    this.name = this.constructor.name;
    this.incident = new Incident(incident);
  }

  // eslint-disable-next-line
  applicable() {
    return true;
  }

  grade() {
    if(!this.applicable()) return;

    const evidence = this.getEvidence();
    return {
      name: this.name,
      description: this.description,
      grade: topLevelGrade(evidence),
      evidence,
    };
  }
}
