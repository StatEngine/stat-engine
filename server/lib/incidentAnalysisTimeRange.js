import moment from 'moment-timezone';
import bodybuilder from 'bodybuilder';
import Promise from 'bluebird';
import _ from 'lodash';

import connection from '../elasticsearch/connection';

export function previousTimeRange(timeRange, options) {
  const sm = moment.parseZone(timeRange.start);
  const em = moment.parseZone(timeRange.end);

  const duration = moment.duration(em.diff(sm));

  return {
    start: moment(sm).subtract(duration.as('milliseconds'), 'milliseconds').format(),
    end: sm.format()
  };
}

export function computePercentChange(newVal, oldVal) {
  if (_.isNil(newVal) || _.isNil(oldVal)) return;
  return _.round((newVal - oldVal) / oldVal * 100, 2);
}

export function buildFireIncidentQuery(timeFilter) {
  return bodybuilder()
    .query('term', 'description.suppressed', false)
    .aggregation('terms', 'description.category', { size: 3, order: { _term: 'asc' }})
    .aggregation('terms', 'address.battalion', { size: 20, order: { _term: 'asc' }})
    .aggregation('percentile_ranks', 'durations.response.seconds', { values: 360 })
    .aggregation('percentiles', 'durations.total_event.minutes', { percents: 90 })
    .aggregation('percentiles', 'durations.turnout.seconds', { percents: 90 })
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', (agg) => agg
      .aggregation('percentiles', 'apparatus.distance', { percents: 90 })
      .aggregation('terms', 'apparatus.unit_id', { size: 500 }, (unitAgg) => unitAgg
        .aggregation('percentiles', 'apparatus.extended_data.turnout_duration', { percents: 90 })
        .aggregation('percentiles', 'apparatus.extended_data.response_duration', { percents: 90 })
        .aggregation('value_count', 'apparatus.unit_status.transport_started.timestamp')
        .aggregation('sum', 'apparatus.distance')
        .aggregation('sum', 'apparatus.extended_data.event_duration')
      )
    )

    .filter('range','description.event_opened', { gte: timeFilter.start, lt: timeFilter.end })
    .build()
}

function categoryBucket(res, categoryName) {
  return _.find(_.get(res, 'aggregations["agg_terms_description.category"].buckets'), u => u.key === categoryName);
}

const fireDepartmentMetrics = [{
  getter: (res) => _.get(res, 'hits.total'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.incidentCount', res),
}, {
  getter: (res) => _.get(categoryBucket(res, 'EMS'), 'doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.emsIncidentCount', res),
}, {
  getter: (res) => _.get(categoryBucket(res, 'FIRE'), 'doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.fireIncidentCount', res),
}, {
  getter: (res) => _.get(res, 'aggregations.apparatus.doc_count'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.responses', res),
}, {
  getter: (res) => _.get(res, 'aggregations["agg_percentile_ranks_durations.response.seconds"]values["360.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.responseDurationPercentileRank360', res),
}, {
  getter: (res) => _.get(res, 'aggregations.["agg_percentiles_durations.turnout.seconds"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.turnoutDurationPercentile90', res),
}, {
  getter: (res) => _.get(res, 'aggregations.apparatus.["agg_percentiles_apparatus.distance"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.distanceToIncidentPercentile90', res),
}, {
  getter: (res) => _.get(res, 'aggregations["agg_percentiles_durations.total_event.minutes"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'fireDepartment.eventDurationPercentile90', res),
}];

const unitMetrics = [{
  getter: (res) => _.get(res, 'doc_count'),
  setter: (obj, res) => _.set(obj, 'incidentCount', res),
}, {
  getter: (res) => _.get(res, '["agg_sum_apparatus.distance"]value'),
  setter: (obj, res) => _.set(obj, 'distanceToIncidentSum', res),
}, {
  getter: (res) => _.get(res, '["agg_sum_apparatus.extended_data.event_duration"]value'),
  setter: (obj, res) => _.set(obj, 'turnoutDurationPercentile90', res),
}, {
  getter: (res) => _.get(res, '["agg_value_count_apparatus.unit_status.transport_started.timestamp"]value'),
  setter: (obj, res) => _.set(obj, 'transportsCount', res),
}, {
  getter: (res) => _.get(res, '["agg_percentiles_apparatus.extended_data.turnout_duration"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'eventDurationSum', res),
}, {
  getter: (res) => _.get(res, '["agg_percentiles_apparatus.extended_data.response_duration"]values["90.0"]'),
  setter: (obj, res) => _.set(obj, 'responseDurationPercentile90', res),
}]

const battalionMetrics = [{
  getter: (res) => _.get(res, 'doc_count'),
  setter: (obj, res) => _.set(obj, 'incidentCount', res),
}]

function analyzeAggregate(results, path, metrics) {
  let current = _.keyBy(_.get(results[0], path), 'key');
  let previous = _.keyBy(_.get(results[1], path), 'key');
  let all = _.uniq(_.concat(_.keys(current), _.keys(previous)));

  console.dir(path)

  console.dir(_.get(results[0], path))
  console.dir(results[0].aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets)
  let retData = {};
  all.forEach(key => {
    let data = {};

    metrics.forEach(metric => {
      const val = metric.getter(current[key]);
      const previousVal = metric.getter(previous[key]);
      const percentChange = computePercentChange(val, previousVal);
      metric.setter(data, { val, previousVal, percentChange })
    });

    retData[key] = data;
  });

  return retData;
}

export class IncidentAnalysisTimeRange {
  constructor(options) {
    this.options = options;
    if (!options.timeRange) throw newError('Must provide timeRange');
    if (!options.index) throw newError('Must provide index');

    this.currentTimeFilter = this.options.timeRange;
    this.previousTimeFilter = previousTimeRange(this.currentTimeFilter);
  }

  run() {
    return Promise.map([
      { index: this.options.index, size: 0, body: buildFireIncidentQuery(this.currentTimeFilter) },
      { index: this.options.index, size: 0, body: buildFireIncidentQuery(this.previousTimeFilter) }
    ], query => connection.getClient().search(query))
      .then(results => {
        const util = require('util')
        console.log(util.inspect(results, {showHidden: false, depth: null}))

        // fireDepartment
        let analysis = {
          fireDepartment: {},
          unit: {},
          battalion: {},
          incidentTypes: {},
        };
        fireDepartmentMetrics.forEach(metric => {
          const val = metric.getter(results[0]);
          const previousVal = metric.getter(results[1]);
          const percentChange = computePercentChange(val, previousVal);
          metric.setter(analysis, { val, previousVal, percentChange })
        });

        // TODO: abstract this code so we dont need to duplicate

        // Units
        /*let currentUnits = _.keyBy(results[0].aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets, 'key');
        let previousUnits = _.keyBy(results[1].aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets, 'key');
        let allUnits = _.uniq(_.concat(_.keys(currentUnits), _.keys(previousUnits)));
        allUnits.forEach(unit => {
          let unitData = {
            unitId: unit,
          };
          unitMetrics.forEach(metric => {
            const val = metric.getter(currentUnits[unit]);
            const previousVal = metric.getter(previousUnits[unit]);
            const percentChange = computePercentChange(val, previousVal);
            metric.setter(unitData, { val, previousVal, percentChange })
          });

          analysis.units[.push(unitData);]
        });

        // Battalions
        let currentBattalions = _.keyBy(results[0].aggregations["agg_terms_address.battalion"].buckets, 'key');
        let previousBattalions = _.keyBy(results[1].aggregations["agg_terms_address.battalion"].buckets, 'key');
        let allBattalions = _.uniq(_.concat(_.keys(currentBattalions), _.keys(previousBattalions)));
        allBattalions.forEach(battalion => {
          let battalionData = {};

          unitMetrics.forEach(metric => {
            const val = metric.getter(currentBattalions[battalion]);
            const previousVal = metric.getter(previousBattalions[battalion]);
            const percentChange = computePercentChange(val, previousVal);
            metric.setter(battalionData, { val, previousVal, percentChange })
          });

          analysis.battalions[battalion] = battalionData;
        });*/
        analysis.unit = analyzeAggregate(results, 'aggregations.apparatus["agg_terms_apparatus.unit_id"]buckets,', unitMetrics)
        analysis.battalion = analyzeAggregate(results, 'aggregations["agg_terms_address.battalion"]buckets', battalionMetrics)

        return Promise.resolve(analysis);
      })
  }
}
