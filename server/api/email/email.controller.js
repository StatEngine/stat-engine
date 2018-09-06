import moment from 'moment-timezone';
import _ from 'lodash';
import util from 'util';

import { FirecaresLookup } from '@statengine/shiftly';

import { sendEmail } from './mandrill';

import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';

import {
  Extension,
  ExtensionConfiguration,
  FireDepartment,
  User,
} from '../../sqldb';

function _getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
}

function _getShiftTimeFrame(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.shiftTimeFrame(date);
  }
}

function _formatDescription(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  let title;
  let subtitle;
  let timeUnit = reportOptions.timeUnit;

  const timeStart = moment.parseZone(timeRange.start);
  if(timeUnit === 'DAY') {
    title = `Shift Report - ${timeStart.format('YYYY-MM-DD')}`;
    subtitle = `Shift ${_getShift(fireDepartment.firecares_id, timeRange.start)}`;
  } else if(timeUnit === 'WEEK') title = `Weekly Report - W${timeStart.week()}`;
  else if(timeUnit === 'MONTH') title = `Monthly Report - ${timeStart.format('MMMM')}`;
  else if(timeUnit === 'YEAR') title = `Yearly Report - ${timeStart.year()}`;

  return {
    name: 'description',
    content: {
      departmentName: fireDepartment.name,
      timeRange: `${moment.parseZone(timeRange.start).format('lll')} - ${moment.parseZone(timeRange.end).format('lll')}`,
      comparisonTimeRange: `${moment.parseZone(comparisonTimeRange.start).format('lll')} - ${moment.parseZone(comparisonTimeRange.end).format('lll')}`,
      runTime: moment()
        .tz(fireDepartment.timezone)
        .format('lll'),
      title,
      subtitle,
      shift: _getShift(fireDepartment.firecares_id, timeRange.start),
    }
  };
}

function _formatOptions(options) {
  return {
    name: 'options',
    content: options,
  };
}

function _formatFireDepartmentMetrics(comparison, options) {
  let mergeVar = {
    name: 'fireDepartmentMetrics',
    content: []
  };

  const metrics = [
    ['Total Incidents', 'incidentCount'],
    ['EMS Incidents', 'emsIncidentCount'],
    ['Fire Incidents', 'fireIncidentCount'],
    ['Total Responses', 'responses'],
    ['Six Minute Response Percentage', 'responseDurationPercentileRank360'],
    ['90% Distance to Incident (mi)', 'distanceToIncidentPercentile90', 'showDistances'],
    ['90% EMS Turnout Duration (sec)', 'emsTurnoutDurationPercentile90'],
    ['90% Fire Turnout Duration (sec)', 'fireTurnoutDurationPercentile90'],
    ['90% Event Duration (min)', 'eventDurationPercentile90']
  ];

  metrics.forEach(metric => {
    const [label, path, condition] = metric;

    let data = _.get(comparison.fireDepartment, path);

    if(!condition || (condition && _.get(options, condition))) {
      mergeVar.content.push(_.merge({}, { label }, data));
    }
  });

  return mergeVar;
}

const unitMetricConfigs = [
  ['incidentCount'],
  ['transportsCount', 'showTransports'],
  ['distanceToIncidentSum', 'showDistances'],
  ['eventDurationSum'],
  ['turnoutDurationPercentile90'],
  ['responseDurationPercentile90'],
];

const battalionMetricConfigs = [
  ['incidentCount'],
];

const incidentTypeMetricConfigs = [
  ['incidentCount'],
];

const agencyIncidentTypeMetricConfigs = [
  ['incidentCount'],
];

function _formatAlerts(ruleAnalysis) {
  let mergeVar = {
    name: 'alerts',
    content: []
  };

  _.forEach(ruleAnalysis, ruleViolations => {
    ruleViolations.forEach(violation => {
      if(violation.level === 'DANGER') violation.rowColor = '#f2dede';
      else if(violation.level === 'WARNING') violation.rowColor = '#fcf8e3';

      mergeVar.content.push(violation);
    });
  });

  if(mergeVar.content.length === 0) {
    mergeVar.content.push({
      rowColor: '#dff0d8',
      description: 'No alerts',
      details: 'Keep up the good work!'
    });
  }

  return mergeVar;
}

function _formatAggregateMetrics(key, metricConfigs, comparison, options) {
  let mergeVar = {
    name: `${key}Metrics`,
    content: []
  };

  _.forEach(comparison[key], (metrics, id) => {
    let obj = {
      id,
    };

    metricConfigs.forEach(metricConfig => {
      const [path, condition] = metricConfig;

      let data = _.get(metrics, path);

      if(!condition || (condition && _.get(options, condition))) {
        obj[path] = _.merge({}, data);
      }
    });

    mergeVar.content.push(obj);
  });

  mergeVar.content = _.sortBy(mergeVar.content, [o => _.get(o, 'incidentCount.val')]).reverse();
  mergeVar.content = _.filter(mergeVar.content, o => _.get(o, 'incidentCount.val') !== 0);

  return mergeVar;
}

export function calculateTimeRange(options) {
  let startDate = options.startDate;
  let endDate = options.endDate;
  let timeUnit = options.timeUnit.toLowerCase();

  if(!endDate && options.timeUnit && options.firecaresId) {
    if (options.previous) {
      startDate = moment.parseZone(startDate).subtract(1, timeUnit);
    } else {
      startDate = moment.parseZone(startDate);
    }

    if(timeUnit === 'day') {
      let shiftTimeFrame = _getShiftTimeFrame(options.firecaresId, startDate.format());
      startDate = shiftTimeFrame.start;
      endDate = shiftTimeFrame.end;
    } else {
      endDate = moment.parseZone(startDate.format()).endOf(timeUnit).format();
      startDate = moment.parseZone(startDate.format()).startOf(timeUnit).format();
    }
  }
  if(!endDate) throw new Error('Could not determine endDate');

  return {
    start: startDate,
    end: endDate,
  };
}

export function runComparison(req, res, next) {
  req.timeRange = calculateTimeRange({ startDate: req.query.startDate, endDate: req.query.endDate, timeUnit: req.reportOptions.timeUnit, firecaresId: req.fireDepartment.get().firecares_id, previous: req.query.previous });
  let Analysis = new IncidentAnalysisTimeRange({
    index: req.fireDepartment.get().es_indices['fire-incident'],
    timeRange: req.timeRange,
  });

  Analysis.compare()
    .then(results => {
      req.comparison = results;
      req.comparisonTimeRange = Analysis.previousTimeFilter;

      next();
    })
    .catch(e => next(e));
}

export function runRuleAnalysis(req, res, next) {
  let Analysis = new IncidentAnalysisTimeRange({
    index: req.fireDepartment.get().es_indices['fire-incident'],
    timeRange: req.timeRange,
  });

  Analysis.ruleAnalysis()
    .then(results => {
      req.ruleAnalysis = results;


      next();
    })
    .catch(e => next(e));
}

export function setEmailOptions(req, res, next) {
  if (!req.query.configurationId) return next(new Error('configurationId is required'));

  ExtensionConfiguration.find({
    where: {
      fire_department__id: req.fireDepartment.get()._id,
      _id: req.query.configurationId,
    },
    include: [{
      model: Extension,
      where: { name: 'Email Report' }
    }]
  }).then(extensionConfiguration => {
    req.reportOptions = extensionConfiguration ? extensionConfiguration.config_json : undefined;

    if(_.isNil(req.reportOptions)) return next(new Error('No report options found'));

    next();
  });
}

export function setEmailRecipients(req, res, next) {
  FireDepartment.find({
    where: {
      _id: req.fireDepartment._id
    },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role']
    }]
  }).then(fd => {
    req.to = [];

    if(_.isNil(req.reportOptions.emailAllUsers) || req.reportOptions.emailAllUsers) {
      fd.Users.forEach(u => req.to.push(u.get()));
    }

    // add additional to
    if(req.reportOptions.to) {
      req.reportOptions.to.forEach(u => req.to.push({
        isAdmin: false,
        _id: u.email,
        email: u.email,
      }));
    }

    next();
  })
    .catch(err => next(err));
}

export function setEmailMergeVars(req, res, next) {
  let description = _formatDescription(req.fireDepartment.get(), req.timeRange, req.comparisonTimeRange, req.reportOptions);
  req.mergeVars = [
    description,
    _formatOptions(req.reportOptions),
    _formatAlerts(req.ruleAnalysis, req.reportOptions),
    _formatFireDepartmentMetrics(req.comparison, req.reportOptions),
    _formatAggregateMetrics('unit', unitMetricConfigs, req.comparison, req.reportOptions),
    _formatAggregateMetrics('battalion', battalionMetricConfigs, req.comparison, req.reportOptions),
    _formatAggregateMetrics('incidentType', incidentTypeMetricConfigs, req.comparison, req.reportOptions),
    _formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, req.comparison, req.reportOptions),
  ];
  req.subject = description.content.title;

  next();
}


export function send(req, res) {
  let promises = [];

  if(_.isEmpty(req.to)) return res.status(200).send();

  let test = true;
  if(req.query.test && req.query.test.toLowerCase() === 'false') test = false;
  req.to.forEach(user => {
    const metadata = {
      firecaresId: req.fireDepartment.firecares_id,
      fireDepartmentName: req.fireDepartment.name,
      userIsAdmin: user.isAdmin,
      userId: user._id,
      timeUnit: req.reportOptions.timeUnit,
    };

    promises.push(sendEmail(user.email, req.subject, 'timerange', req.mergeVars, test, metadata));
  });

  Promise.all(promises)
    .then(() => res.status(204).send())
    .catch(e => {
      console.error(e);
      res.status(500).send();
    });
}
