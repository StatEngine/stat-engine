import _ from 'lodash';
import moment from 'moment';
import { IncidentRule, GRADES } from '../../incident-rule';

export default class Turnout extends IncidentRule {
  constructor(incident) {
    super(incident);

    this.threshold = this.incident.isFireIncident() ? 80 : 60;
    this.description = `Unit turnout should be less than ${this.threshold} seconds`;
  }

  applicable() {
    return this.incident.hasApparatus();
  }

  getEvidence() {
    const evidence = [];

    _.forEach(this.incident.apparatus, u => {
      const turnout = _.get(u, 'extended_data.turnout_duration');
      if (turnout) {
        let grade = GRADES.SUCCESS;
        if (turnout > this.threshold) grade = GRADES.DANGER;
        evidence.push({
          text: `${u.unit_id} turnout time was ${turnout} seconds.`,
          grade
        });
      }
    });

    return evidence;
  }
}
