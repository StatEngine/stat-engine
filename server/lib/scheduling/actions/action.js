class Action {
  constructor(options) {
    this.options = options || {};
  }

  run() {
    throw new Error('Not implemented.');
  }
}

export default Action;
