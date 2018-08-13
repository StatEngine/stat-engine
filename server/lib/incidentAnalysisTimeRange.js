import moment from 'moment-timezone';
import bodybuilder from 'bodybuilder';
import Promise from 'bluebird';
import _ from 'lodash';
import util from 'util';

import connection from '../elasticsearch/connection';

import { FireIncidentEventDurationRule } from './rules/fireIncidentEventDurationRule';
import { EventDurationSumRule } from './rules/eventDurationSumRule';

export function previousTimeRange(timeRange) {
  const sm = moment.parseZone(timeRange.start);
  const em = moment.parseZone(timeRange.end);

  const duration = moment.duration(em.diff(sm));

  return {
    start: moment(sm)
      .subtract(duration.as('milliseconds'), 'milliseconds')
      .format(),
    end: sm.format()
  };
}

export function computePercentChange(newVal, oldVal) {
  if(_.isNil(oldVal)) return;
  return _.round((newVal - oldVal) / oldVal * 100, 2);
}

export function buildFireIncidentQuery(timeFilter) {
  return bodybuilder()
    .filter('term', 'description.suppressed', false)
    .aggregation('terms', 'description.category', { size: 3, order: { _term: 'asc' }}, categoryAgg => categoryAgg
      .aggregation('percentiles', 'durations.turnout.seconds', { percents: 90 }))
    .aggregation('terms', 'address.battalion', { size: 20, order: { _term: 'asc' }})
    .aggregation('terms', 'description.type', { size: 50, order: { _term: 'asc' }})
    .aggregation('terms', 'description.extended_data.AgencyIncidentCallTypeDescription.keyword', { size: 50, order: { _term: 'asc' }})
    .aggregation('percentile_ranks', 'durations.response.seconds', { values: 360 })
    .aggregation('percentiles', 'durations.total_event.minutes', { percents: 90 })
    .aggregation('percentiles', 'durations.turnout.seconds', { percents: 90 })
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('percentiles', 'apparatus.distance', { percents: 90 })
      .aggregation('terms', 'apparatus.unit_id', { size: 500 }, unitAgg => unitAgg
        .aggregation('percentiles', 'apparatus.extended_data.turnout_duration', { percents: 90 })
        .aggregation('percentiles', 'apparatus.extended_data.response_duration', { percents: 90 })
        .aggregation('value_count', 'apparatus.unit_status.transport_started.timestamp')
        .aggregation('sum', 'apparatus.distance')
        .aggregation('sum', 'apparatus.extended_data.event_duration')))
    .filter('range', 'description.event_opened', { gte: timeFilter.start, lt: timeFilter.end })
    .build();
}

function categoryBucket(res, categoryName) {
  return _.find(_.get(res, 'aggregations["agg_terms_description.category"].buckets'), u => u.key === categoryName);
}

const fireDepartmentMetrics = [{
  getter: res => _.get(res, 'hits.total'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.incidentCount', res),
}, {
  getter: res => _.get(categoryBucket(res, 'EMS'), 'doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.emsIncidentCount', res),
}, {
  getter: res => _.get(categoryBucket(res, 'FIRE'), 'doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.fireIncidentCount', res),
}, {
  getter: res => _.get(res, 'aggregations.apparatus.doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.responses', res),
}, {
  getter: res => _.get(res, 'aggregations["agg_percentile_ranks_durations.response.seconds"]values["360.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.responseDurationPercentileRank360', res),
}, {
  getter: res => _.get(categoryBucket(res, 'EMS'), '["agg_percentiles_durations.turnout.seconds"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.emsTurnoutDurationPercentile90', res),
},  {
  getter: res => _.get(categoryBucket(res, 'FIRE'), '["agg_percentiles_durations.turnout.seconds"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.fireTurnoutDurationPercentile90', res),
}, {
  getter: res => _.get(res, 'aggregations.apparatus.["agg_percentiles_apparatus.distance"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.distanceToIncidentPercentile90', res),
}, {
  getter: res => _.get(res, 'aggregations["agg_percentiles_durations.total_event.minutes"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.eventDurationPercentile90', res),
}];

const unitMetrics = [{
  getter: res => _.get(res, 'doc_count'),
  setter: (obj, res) => _.set(obj, 'incidentCount', res),
}, {
  getter: res => _.get(res, '["agg_sum_apparatus.distance"]value'),
  setter: (obj, res) => _.set(obj, 'distanceToIncidentSum', res),
}, {
  getter: res => {
    let val = _.get(res, '["agg_sum_apparatus.extended_data.event_duration"]value');
    if(val) val = val / 60.0;
    return val;
  },
  setter: (obj, res) => _.set(obj, 'eventDurationSum', res),
}, {
  getter: res => _.get(res, '["agg_value_count_apparatus.unit_status.transport_started.timestamp"]value'),
  setter: (obj, res) => _.set(obj, 'transportsCount', res),
}, {
  getter: res => _.get(res, '["agg_percentiles_apparatus.extended_data.turnout_duration"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'turnoutDurationPercentile90', res),
}, {
  getter: res => _.get(res, '["agg_percentiles_apparatus.extended_data.response_duration"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'responseDurationPercentile90', res),
}];

const battalionMetrics = [{
  getter: res => _.get(res, 'doc_count'),
  setter: (obj, res) => _.set(obj, 'incidentCount', res),
}];

const incidentTypeMetrics = [{
  getter: res => _.get(res, 'doc_count'),
  setter: (obj, res) => _.set(obj, 'incidentCount', res),
}];

function analyzeAggregate(results, path, metrics) {
  let current = _.keyBy(_.get(results[0], path), 'key');
  let previous = _.keyBy(_.get(results[1], path), 'key');
  let all = _.uniq(_.concat(_.keys(current), _.keys(previous)));

  let retData = {};
  all.forEach(key => {
    let data = {};

    metrics.forEach(metric => {
      let val = metric.getter(current[key]);
      if(_.isNil(val)) val = 0;
      const previousVal = metric.getter(previous[key]);
      const percentChange = computePercentChange(val, previousVal);
      metric.setter(data, { val: round(val, 0), previousVal: round(previousVal, 0), percentChange: round(percentChange, 0) });
    });

    retData[key] = data;
  });

  return retData;
}

export function round(num, precision) {
  if(_.isNumber(num)) return _.round(num, precision);
  return num;
}

export class IncidentAnalysisTimeRange {
  constructor(options) {
    this.options = options;
    if(!options.timeRange) throw new Error('Must provide timeRange');
    if(!options.index) throw new Error('Must provide index');

    this.currentTimeFilter = this.options.timeRange;
    this.previousTimeFilter = previousTimeRange(this.currentTimeFilter);
  }

  ruleAnalysis() {
    let ruleConfig = [
      EventDurationSumRule,
      FireIncidentEventDurationRule,
    ];

    let rules = [];
    let queries = [];
    ruleConfig.forEach(rule => {
      let myRule = new rule();
      rules.push(myRule);
      let query = myRule.query.filter('range', 'description.event_opened', { gte: this.currentTimeFilter.start, lt: this.currentTimeFilter.end }).build();
      queries.push({});
      queries.push(query);
    });

    return connection.getClient().msearch({
      index: this.options.index,
      body: queries,
      maxConcurrentSearches: 5,
    })
      .then(results => {
        let analysis = {};
        _.each(results.responses, (result, index) => {
          let rule = rules[index];
          rule.setResults(results.responses[index]);
          analysis[rule.constructor.name] = rule.analyze();
        });

        console.log(util.inspect(analysis, {showHidden: false, depth: null}));
        return Promise.resolve(analysis);
      });
  }

  compare() {
    return Promise.map([
      { index: this.options.index, size: 0, body: buildFireIncidentQuery(this.currentTimeFilter) },
      { index: this.options.index, size: 0, body: buildFireIncidentQuery(this.previousTimeFilter) }
    ], query => connection.getClient().search(query))
      .then(results => {
        console.log(util.inspect(results, {showHidden: false, depth: null}));

        // fireDepartment
        let comparison = {
          fireDepartment: {},
          unit: {},
          battalion: {},
          incidentType: {},
          agencyIncidentType: {},
        };
        fireDepartmentMetrics.forEach(metric => {
          let val = metric.getter(results[0]);
          if(_.isNil(val)) val = 0;
          const previousVal = metric.getter(results[1]);
          const percentChange = computePercentChange(val, previousVal);
          metric.setter(comparison, { val: round(val, 0), previousVal: round(previousVal, 0), percentChange: round(percentChange, 0) });
        });

        comparison.unit = analyzeAggregate(results, 'aggregations.apparatus["agg_terms_apparatus.unit_id"]buckets', unitMetrics);
        comparison.battalion = analyzeAggregate(results, 'aggregations["agg_terms_address.battalion"]buckets', battalionMetrics);
        comparison.incidentType = analyzeAggregate(results, 'aggregations["agg_terms_description.type"]buckets', incidentTypeMetrics);
        comparison.agencyIncidentType = analyzeAggregate(results, 'aggregations["agg_terms_description.extended_data.AgencyIncidentCallTypeDescription.keyword"]buckets', incidentTypeMetrics);

        return Promise.resolve(comparison);
      });
  }
}