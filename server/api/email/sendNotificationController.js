import handlebars from 'handlebars';
import moment from 'moment-timezone';
import _ from 'lodash';
import { FirecaresLookup } from '@statengine/shiftly';
import sendNotification from './sendNotification';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { Extension,
  ExtensionConfiguration,
  FireDepartment,
  User } from '../../sqldb';
import { TimeUnit } from '../../components/constants/time-unit';
import { BadRequestError, InternalServerError } from '../../util/error';
import { Log } from '../../util/log';
import { unitMetricConfigs, battalionMetricConfigs, jurisdictionMetricConfigs, incidentTypeMetricConfigs, agencyIncidentTypeMetricConfigs, alertColors } from './sendNotificationControllerConstants';
import config from '../../config/environment';
import HtmlReports from './htmlReports';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';

// eslint-disable-next-line consistent-return
export default async function sendNotificationController(req, res) {
  const configId = req.query.configurationId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const previous = req.query.previous;
  const fireDepartment = req.fireDepartment.get();
  const firecaresId = fireDepartment.firecares_id;
  const index = fireDepartment.es_indices['fire-incident'];
  const test = !!(req.query.test && req.query.test.toLowerCase() === 'true');

  if (!configId) {
    throw new BadRequestError('Query param "configurationId" is required');
  }
  const reportOptions = await getReportOptions(fireDepartment, configId);

  if (_.isNil(reportOptions)) {
    throw new InternalServerError('No report options found!');
  }

  //
  // Run comparison and rule analysis.
  //
  const timeRangeParams = { startDate, endDate, timeUnit: reportOptions.timeUnit, firecaresId, previous };
  const timeRange = calculateTimeRange(timeRangeParams);
  const analysis = new IncidentAnalysisTimeRange({ index, timeRange });
  const comparison = await analysis.compare();
  const ruleAnalysis = await analysis.ruleAnalysis();

  const toUsersByEmail = await emailRecipients(fireDepartment, reportOptions);

  // Add additional to.
  if (reportOptions.to) {
    reportOptions.to.forEach(u => {
      // Don't add the same email twice.
      if (toUsersByEmail[u.email]) {
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


  if (_.isEmpty(toUsers)) {
    return res.status(200).send();
  }

  const description = _formatDescription(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);
  const globalMergeVars = [
    description,
    _formatOptions(reportOptions),
    _formatAlerts(ruleAnalysis, reportOptions),
    _formatFireDepartmentMetrics(comparison, reportOptions),
    _formatAggregateMetrics('unit', unitMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('agencyResponses', unitMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('battalion', battalionMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('jurisdiction', jurisdictionMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('incidentType', incidentTypeMetricConfigs, comparison, reportOptions),
    _formatAggregateMetrics('agencyIncidentType', agencyIncidentTypeMetricConfigs, comparison, reportOptions),
  ];
  Log.debug('globalMergeVars', globalMergeVars);
  const subject = description.content.title;

  const htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
    handlebars,
    config.mailSettings.emailShellTemplatePath,
    config.mailSettings.emailPartialsTemplatePath,
  ).template());


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
      content: { isExternal: metadata.userIsExternal },
    });

    promises.push(sendNotification(
      user.email,
      subject,
      htmlReports.report(mergeVars),
      test,
      metadata,
    ));
  });

  await Promise.all(promises);

  res.status(204).send();
}

function _mergeVarsToObj(mergeVarsArray) {
  return mergeVarsArray.reduce((acc, mergeVar) => {
    acc[mergeVar.name] = mergeVar.content;
    return acc;
  }, {});
}

async function emailRecipients(fireDepartment, reportOptions) {
  const fd = await FireDepartment.find({
    where: { _id: fireDepartment._id },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['_id', 'first_name', 'last_name', 'email', 'role', 'unsubscribed_emails'],
    }],
  });

  const toUsersByEmail = {};

  if (_.isNil(reportOptions.emailAllUsers) || reportOptions.emailAllUsers) {
    fd.Users.forEach(u => {
      toUsersByEmail[u.email] = u;
    });
  }
  return toUsersByEmail;
}

async function getReportOptions(fireDepartment, configId) {
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

  if (!extensionConfig) {
    Log.error('Unable to find extension for fire department ', fireDepartment);
    throw new Error(`Unable to find extension for fire department${fireDepartment}`);
  }

  const reportOptions = extensionConfig.config_json;
  reportOptions.showPercentChange = !!_.isUndefined(reportOptions.showPercentChange);
  reportOptions.showUtilization = !!_.isUndefined(reportOptions.showUtilization);

  // Override day reports to use shift time.
  if (reportOptions.timeUnit.toLowerCase() === TimeUnit.Day) {
    reportOptions.timeUnit = TimeUnit.Shift;
  }
  return reportOptions;
}

function _getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if (ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
  Log.error('No data found for firecares ID', firecaresId);
  throw new Error(`No data found for firecares ID ${firecaresId}`);
}

export function _formatDescription(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  let title;
  let subtitle;
  const timeUnit = reportOptions.timeUnit.toLowerCase();

  const timeStart = moment.parseZone(timeRange.start);
  if (timeUnit === TimeUnit.Shift) {
    title = `Shift Report - ${timeStart.format('YYYY-MM-DD')}`;
    subtitle = `Shift ${_getShift(fireDepartment.firecares_id, timeRange.start)}`;
  } else if (timeUnit === TimeUnit.Week) { title = `Weekly Report - W${timeStart.week()}`; } else if (timeUnit === TimeUnit.Month) { title = `Monthly Report - ${timeStart.format('MMMM')}`; } else if (timeUnit === TimeUnit.Year) { title = `Yearly Report - ${timeStart.year()}`; }

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
    },
  };
}

function _formatOptions(options) {
  return {
    name: 'options',
    content: options,
  };
}

function _formatFireDepartmentMetrics(comparison, options) {
  const mergeVar = {
    name: 'fireDepartmentMetrics',
    content: [],
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
    ['90% Event Duration (min)', 'eventDurationPercentile90'],
  ];

  metrics.forEach(metric => {
    const [label, path, condition] = metric;

    const data = _.get(comparison.fireDepartment, path);

    if (!condition || (condition && _.get(options, condition))) {
      mergeVar.content.push(_.merge({}, { label }, data));
    }
  });

  return mergeVar;
}

export function _formatAlerts(ruleAnalysis, reportOptions) {
  const mergeVar = {
    name: 'alerts',
    content: [],
  };

  _.forEach(ruleAnalysis, ruleViolations => {
    ruleViolations.forEach(violation => {
      if (violation.level === 'DANGER') {
        violation.rowColor = alertColors.danger.row;
        violation.rowBorderColor = alertColors.danger.rowBorder;
      } else if (violation.level === 'WARNING') {
        violation.rowColor = alertColors.warning.row;
        violation.rowBorderColor = alertColors.warning.rowBorder;
      }

      const showAlert = _.get(reportOptions, `sections.showAlertSummary[${violation.rule}]`);
      if (showAlert || (_.isUndefined(showAlert) && violation.default_visibility)) { mergeVar.content.push(violation); }
    });
  });

  if (mergeVar.content.length === 0) {
    mergeVar.content.push({
      rowColor: alertColors.warning.row,
      rowBorderColor: alertColors.warning.rowBorder,
      description: 'No alerts found for today',
      details: 'If this is unexpected, please contact support.',
    });
  }

  return mergeVar;
}

function _formatAggregateMetrics(key, metricConfigs, comparison, options) {
  const mergeVar = {
    name: `${key}Metrics`,
    content: [],
  };

  _.forEach(comparison[key], (metrics, id) => {
    const obj = { id };

    metricConfigs.forEach(metricConfig => {
      const [path, condition] = metricConfig;

      const data = _.get(metrics, path);

      if (!condition || (condition && _.get(options, condition))) {
        obj[path] = _.merge({}, data);
      }
    });

    mergeVar.content.push(obj);
  });

  mergeVar.content = _.sortBy(mergeVar.content, [o => _.get(o, 'incidentCount.val')]).reverse();
  mergeVar.content = _.filter(mergeVar.content, o => _.get(o, 'incidentCount.val') !== 0);

  return mergeVar;
}
