import { createAction } from './action-factory';

class Watcher {
  constructor(actionName, actionOptions) {
    this.actionName = actionName;
    this.actionOptions = actionOptions;
  }

  execute() {
    const action = createAction(this.actionName, this.actionOptions);

    return action.run();
  }
}

export default Watcher;
