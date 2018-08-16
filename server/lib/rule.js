export class Rule {
  constructor(params) {
    this.params = params || {};
  }

  setResults(results) {
    this.results = results;
  }
}

export default { Rule };
