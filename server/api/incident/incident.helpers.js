import _ from 'lodash';
import path from 'path';

import { Incident } from './incident';

const templates = require('dot').process({ path: path.join(__dirname, './templates') });
const analysisRules = require('require-all')({ dirname: path.join(__dirname, './analysis-rules/') });

export function generateTextualSummaries(incident) {
  const i = new Incident(incident);

  const summaries = {};
  _.forOwn(templates, (t, key) => {
    summaries[_.snakeCase(key)] = templates[key](i);
  });

  return summaries;
}

export function generateAnalysis(incident) {
  let analysis = [];

  _.forOwn(analysisRules, Rule => {
    let rule = new Rule.default(incident);
    analysis.push(rule.grade());
  });

  return _.filter(analysis, a => !_.isNil(a));
}
