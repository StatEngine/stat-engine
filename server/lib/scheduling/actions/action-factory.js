import _ from 'lodash';

import CustomEmail from './customEmail';

const registrations = { customEmail: CustomEmail };

export function createAction(name, options = {}) {
  const Action = registrations[name];
  if (!Action) {
    return undefined;
  }

  return new Action(_.cloneDeep(options));
}

export default { createAction };
