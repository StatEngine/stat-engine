import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import { Rule } from '../rule';

export class TurnoutDurationOutlierRule extends Rule {
  constructor(params) {
    super(params);
    this.params.threshold = this.params.threshold || 300;
    this.params.level = 'DANGER';

    let apparatus = bodybuilder()
      .filter('range', 'apparatus.extended_data.turnout_duration', { gte: this.params.threshold})
      .build();
    apparatus.path = 'apparatus';

    this.query = bodybuilder()
      .filter('term', 'description.suppressed', false)
      .filter('nested', apparatus)
      .size(1000);
  }

  analyze() {
    let analysis = [];

    this.results.hits.hits.forEach(hit => {
      let units = [];
      let incidentNumber = _.get(hit, '_source.description.incident_number');
      hit._source.apparatus.forEach(u => {
        let turnout_duration = _.get(u, 'extended_data.turnout_duration');
        if(turnout_duration > this.params.threshold) units.push(`${u.unit_id}:<strong>${turnout_duration} s</strong>`);
      });

      if (units.length >= 1) {
        analysis.push({
          rule: this.constructor.name,
          level: this.params.level,
          description: `Unit turnout > ${(this.params.threshold).toFixed(0)} sec`,
          details: `Incident: <a target="_blank" href="https://statengine.io/incidents/${incidentNumber}">${incidentNumber}</a> <br> Units: ${units.join(',')}`,
          default_visibility: false,
        });
      }
    });

    return analysis;
  }
}

export default { TurnoutDurationOutlierRule };
