import moment from 'moment-timezone';
import _ from 'lodash';

import { FirecaresLookup } from '@statengine/shiftly';

import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';

function _getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];

  if (ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
}

function _formatDescription(fireDepartment, timeRange, options) {
  return {
    name: 'description',
    content: {
      departmentName: fireDepartment.name,
      timeRange: `${moment.parseZone(timeRange.start).format('lll')} - ${moment.parseZone(timeRange.end).format('lll')}`,
      runTime: moment().tz(fireDepartment.timezone).format('lll'),
      logo: options.logo,
      shift: _getShift(fireDepartment.firecares_id, timeRange.start),
    }
  }
}

function _formatFireDepartmentMetrics(analysis, options) {
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
    ['90% Turnout Duration (sec)', 'turnoutDurationPercentile90'],
    ['90% Event Duration (min)', 'eventDurationPercentile90']
  ]

  metrics.forEach(metric => {
    const [label, path, condition] = metric;

    let data = _.get(analysis.fireDepartment, path);

    if (!condition || (condition && _.get(options, condition))) {
      mergeVar.content.push(_.merge({}, { label }, data));
    }
  });

  return mergeVar;
}

function _formatUnitMetrics(analysis, options) {
  let mergeVar = {
    name: 'unitMetrics',
    content: []
  };

  const metrics = [
    ['Incidents', 'incidentCount'],
    ['Transports', 'transportsCount', 'showTransports'],
    ['Distance (mi)', 'distanceToIncidentSum', 'showDistances'],
    ['Utilization (min)', ''],
    ['90% Turnout (sec)', ''],
    ['90% Response (min)', ''],
  ]

  _.forEach(analysis.unit, (unitMetrics, unitId) => {
    let unitVar = {
      unitId,
      metrics: [],
    };

    metrics.forEach(metric => {
      const [label, path, condition] = metric;

      let data = _.get(unitMetrics, path);

      if (!condition || (condition && _.get(options, condition))) {
        unitVar.metrics.push(_.merge({}, { label }, data));
      }
    });

      mergeVar.content.push(unitVar);
  });

  return mergeVar;
}

function _formatIncidentTypeMetrics(analysis, options) {
  let mergeVar = {
    name: 'incidentTypeMetrics',
    content: []
  };

  const metrics = [
    ['Incidents', 'incidentCount'],
    ['90% Turnout (sec)', ''],
    ['90% Event Duration (min)', ''],
  ]

  _.forEach(analysis.incidentType, (incidentTypeMetrics, incidentTypeId) => {
    let incidentTypeVar = {
      incidentTypeId,
      metrics: [],
    };

    metrics.forEach(metric => {
      const [label, path, condition] = metric;

      let data = _.get(incidentTypeMetrics, path);

      if (!condition || (condition && _.get(options, condition))) {
        incidentTypeVar.metrics.push(_.merge({}, { label }, data));
      }
    });

      mergeVar.content.push(incidentTypeVar);
  });

  return mergeVar;
}


export function runAnalysis(req, res, next) {
  let analysis = new IncidentAnalysisTimeRange({
    index: req.fireDepartment.get().es_indices['fire-incident'],
    timeRange: req.body.timeRange,
  });

  analysis.run()
    .then(results => {
      req.analysis = results;
    })
}

export function setMergeVars(req, res, next) {
  req.mergeVars = [
    _formatDescription(req.fireDepartment.get(), req.body.timeRange, req.reportOptions),
    _formatFireDepartmentMetrics(req.analysis, req.reportOptions),
    _formatUnitMetrics(req.analysis, req.reportOptions),
    _formatIncidentTypeMetrics(req.analysis, req.reportOptions),
  ];

  const util = require('util')
  console.log(util.inspect(req.mergeVars, {showHidden: false, depth: null}))

  //next();
}
