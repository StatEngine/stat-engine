'use strict';

import moment from 'moment-timezone';
import _ from 'lodash';
import { FirecaresLookup } from '@statengine/shiftly';

import { sendEmail } from './mandrill';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import {
  Extension,
  ExtensionConfiguration,
  FireDepartment,
  User,
} from '../../sqldb';
import config from '../../config/environment';
import { TimeUnit } from '../../components/constants/time-unit';
import { BadRequestError, InternalServerError } from '../../util/error';
import { Log } from '../../util/log';

export async function sendTimeRangeAnalysis(req, res) {
  const configId = req.query.configurationId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const previous = req.query.previous;
  const test = !!(req.query.test && req.query.test.toLowerCase() === 'true');

  if(!configId) {
    throw new BadRequestError('Query param "configurationId" is required');
  }

  //
  // Set email options.
  //

  const fireDepartment = req.fireDepartment.get();

  const extensionConfig = await ExtensionConfiguration.find({
    where: {
      fire_department__id: fireDepartment._id,
      _id: configId,
    },
    include: [{
      model: Extension,
      where: { name: 'Email Report' },
    }],
  });

  const reportOptions = extensionConfig ? extensionConfig.config_json : undefined;

  // Override day reports to use shift time.
  if(reportOptions.timeUnit.toLowerCase() === TimeUnit.Day) {
    reportOptions.timeUnit = TimeUnit.Shift;
  }

  if(_.isNil(reportOptions)) {
    throw new InternalServerError('No report options found!');
  }

  //
  // Run comparison and rule analysis.
  //

  const timeRange = calculateTimeRange({
    startDate,
    endDate,
    timeUnit: reportOptions.timeUnit,
    firecaresId: fireDepartment.firecares_id,
    previous,
  });

  const analysis = new IncidentAnalysisTimeRange({
    index: fireDepartment.es_indices['fire-incident'],
    timeRange,
  });

  const comparison = await analysis.compare();
  const ruleAnalysis = await analysis.ruleAnalysis();

  //
  // Set email recipients.
  //

  const fd = await FireDepartment.find({
    where: {
      _id: fireDepartment._id,
    },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails']
    }]
  });

  const toUsersByEmail = {};

  if(_.isNil(reportOptions.emailAllUsers) || reportOptions.emailAllUsers) {
    fd.Users.forEach(u => {
      toUsersByEmail[u.email] = u;
    });
  }

  // Add additional to.
  if(reportOptions.to) {
    reportOptions.to.forEach(u => {
      // Don't add the same email twice.
      if(toUsersByEmail[u.email]) {
        return;
      }

      toUsersByEmail[u.email] = {
        isAdmin: false,
        isExternal: true,
        _id: u.email,
        email: u.email,
        isSubscribedToEmail: () => true,
      };
    });
  }

  let toUsers = Object.keys(toUsersByEmail).map(email => toUsersByEmail[email]);

  // Remove unsubscribed users from the email list.
  toUsers = toUsers.filter(user => user.isSubscribedToEmail(reportOptions.name));


  if(_.isEmpty(toUsers)) {
    return res.status(200).send();
  }

  //
  // Set email merge vars.
  //

  const description = _formatDescription(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);
  const globalMergeVars = [
    description,
    _formatOptions(reportOptions),
    _formatAlerts(ruleAnalysis, reportOptions),
    _formatFireDepartmentMetrics(comparison, reportOptions),
    _formatAggregateMetrics('unit', unitMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('agencyResponses', unitMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('battalion', battalionMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('incidentType', incidentTypeMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, comparison, reportOptions),
  ];
  Log.debug('globalMergeVars', globalMergeVars);
  const subject = description.content.title;

  //
  // Send email.
  //

  const promises = [];
  toUsers.forEach(user => {
    const metadata = {
      firecaresId: fireDepartment.firecares_id,
      fireDepartmentName: fireDepartment.name,
      userIsAdmin: user.isAdmin,
      userIsExternal: !!user.isExternal,
      userId: user._id,
      timeUnit: reportOptions.timeUnit,
    };

    const mergeVars = globalMergeVars.slice(0);
    mergeVars.push({
      name: 'user',
      content: {
        isExternal: metadata.userIsExternal,
      },
    });

    promises.push(sendEmail(user.email, subject, config.mailSettings.timeRangeTemplate, mergeVars, test, metadata));
  });

  await Promise.all(promises);

  res.status(204).send();
}

function _getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if(ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
}


//
// Helpers
//

function _getTimeRangeEmailId(timeUnit) {
  return `${config.mailSettings.timeRangeTemplate}_${timeUnit}`.toLowerCase();
}

function _formatDescription(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  let title;
  let subtitle;
  let timeUnit = reportOptions.timeUnit.toLowerCase();

  const timeStart = moment.parseZone(timeRange.start);
  if(timeUnit === TimeUnit.Shift) {
    title = `Shift Report - ${timeStart.format('YYYY-MM-DD')}`;
    subtitle = `Shift ${_getShift(fireDepartment.firecares_id, timeRange.start)}`;
  } else if(timeUnit === TimeUnit.Week) title = `Weekly Report - W${timeStart.week()}`;
  else if(timeUnit === TimeUnit.Month) title = `Monthly Report - ${timeStart.format('MMMM')}`;
  else if(timeUnit === TimeUnit.Year) title = `Yearly Report - ${timeStart.year()}`;

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
  ['fireTurnoutDurationPercentile90'],
  ['emsTurnoutDurationPercentile90'],
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

const alertColors = {
  success: {
    row: '#dff0d8',
    rowBorder: '#83d062',
  },
  warning: {
    row: '#fcf8e3',
    rowBorder: '#c7ba75',
  },
  danger: {
    row: '#f2dede',
    rowBorder: '#bb7474',
  },
};

function _formatAlerts(ruleAnalysis, reportOptions) {
  let mergeVar = {
    name: 'alerts',
    content: []
  };

  _.forEach(ruleAnalysis, ruleViolations => {
    ruleViolations.forEach(violation => {
      if(violation.level === 'DANGER') {
        violation.rowColor = alertColors.danger.row;
        violation.rowBorderColor = alertColors.danger.rowBorder;
      }
      else if(violation.level === 'WARNING') {
        violation.rowColor = alertColors.warning.row;
        violation.rowBorderColor = alertColors.warning.rowBorder;
      }

      let showAlert = _.get(reportOptions, `sections.showAlertSummary[${violation.rule}]`);
      if(_.isUndefined(showAlert) || showAlert) mergeVar.content.push(violation);
    });
  });

  if(mergeVar.content.length === 0) {
    mergeVar.content.push({
      rowColor: alertColors.success.row,
      rowBorderColor: alertColors.success.rowBorder,
      description: 'No alerts',
      details: 'Keep up the good work!'
    });
  }

  // Add a space after any comma without one after it.
  mergeVar.content.forEach(alert => {
    alert.details = alert.details.replace(/(,(?=\S))/g, ', ')
  })

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
