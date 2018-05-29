import _ from 'lodash';
import moment from 'moment-timezone';
import path from 'path';

import { Incident } from './incident';

const templates = require('dot').process({ path: path.join(__dirname, './templates') });
const analysisRules = require('require-all')({ dirname: path.join(__dirname, './analysis-rules/') });

export function generateTextualSummaries(incident) {
  const i = new Incident(incident);

  const summaries = {};
  _.forOwn(templates, (t, key) => summaries[key] = templates[key](i));

  return summaries;
}

export function generateAnalysis(incident) {
  let analysis = {};

  _.forOwn(analysisRules, (rules, category) => {
    analysis[category] = {};

    _.forEach(rules, Rule => {
      let rule = new Rule.default(incident);
      analysis[category][rule.name] = rule.grade();
    })
  });

  return analysis;
}
