import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import { TurnoutDurationOutlierRule } from './turnoutDurationOutlierRule';

export class TurnoutDurationOutlierRule120 extends TurnoutDurationOutlierRule {
  constructor(params) {
    super(params);
    this.params.threshold = 120;
    this.params.level = 'WARNING';
  }

  analyze() {
    let anal = super.analyze();
    anal.forEach(a => _.set(a, 'default_visibility', true));
    return anal;
  }
}

export default { TurnoutDurationOutlierRule120 };
