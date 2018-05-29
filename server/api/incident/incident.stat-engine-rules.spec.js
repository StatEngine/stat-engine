import {
  FireTurnout90,
} from './incident.stat-engine-rules';

import 'chai/register-should';
import _ from 'lodash';

let incident = {
  "description": {
    "category": "FIRE"
  },
  "apparatus": [
    {
      "unit_id": "E14",
      "extended_data": {
        "travel_duration": 541,
        "turnout_duration": 63,
        "response_duration": 604,
        "event_duration": 982
      },
    },
    {
      "unit_id": "E16",
      "extended_data": {
        "turnout_duration": 77,
      },
    },
    {
      "unit_id": "T10",
      "extended_data": {
        "turnout_duration": 77,
      },
    }
  ],
};

describe('90s fire turnout', () => {
  it('should not apply to non-fire incidents', () => {
    let clone = _.cloneDeep(incident);
    clone.description.category = 'EMS';
    let rule = new FireTurnout90(clone);

    should.not.exist(rule.grade());
  });

  it('should test for 90s fire incident', () => {
    let clone = _.cloneDeep(incident);
    let rule = new FireTurnout90(clone);
    console.dir(rule.grade())
  });
});
