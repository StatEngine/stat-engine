import _ from 'lodash';
import bodybuilder from 'bodybuilder';
import moment from 'moment-timezone';
import { FirecaresLookup } from '@statengine/shiftly';

import connection from '../../../elasticsearch/connection';
import { generateAnalysis, generateTextualSummaries } from '../../incident/incident.helpers';
import { getUnitBusynessLabel, getUnitBusynessQuintiles } from '../../../util/statistics';
import { BadRequestError } from '../../../util/error';

export async function getIncidentAnalysis(req, res) {
  const bodyBuilder = bodybuilder()
    .from(0)
    .size(20)
    .filter('term', 'description.active', false)
    .filter('term', 'description.suppressed', false)
    .sort('description.event_closed', 'desc');

  const esIncidents = await connection.getClient().search({
    index: req.fireDepartment.es_indices['fire-incident'],
    body: bodyBuilder.build(),
  });

  const incidents = esIncidents.hits.hits.map(esIncident => {
    const source = esIncident._source;
    const textSummaries = generateTextualSummaries(source);
    return {
      description: {
        event_closed: source.description.event_closed,
      },
      address: {
        latitude: source.address.latitude,
        longitude: source.address.longitude,
        address_line1: source.address.address_line1,
        battalion: source.address.battalion,
      },
      text_summaries: {
        incident_summary: textSummaries.incident_summary,
        response_summary: textSummaries.response_summary,
      },
      durations: {
        alarm_answer: source.durations.alarm_answer,
        arrival_from_event_opened: source.durations.arrival_from_event_opened,
        total_event: source.durations.total_event,
      },
      apparatus: source.apparatus.map(apparatus => {
        return {
          unit_id: apparatus.unit_id,
          unit_status: {
            dispatched: apparatus.unit_status.dispatched,
          },
          durations: {
            travel: {
              seconds: parseFloat(apparatus.extended_data.travel_duration),
            },
            turnout: {
              seconds: parseFloat(apparatus.extended_data.turnout_duration),
            },
          },
        };
      }),
      analysis: generateAnalysis(source),
    };
  });

  res.json({ incidents });
}

export async function getUnitUtilization(req, res) {
  const interval = (req.query.interval || '').toLowerCase();

  const intervalsAllowed = ['shift', 'day', 'week', 'month', 'quarter', 'year'];
  if(!intervalsAllowed.includes(interval)) {
    throw new BadRequestError(`Parameter "interval" must be one of the following: ${intervalsAllowed.join(' | ')}`)
  }

  const timeRange = getTimeRange(req.fireDepartment, interval);
  const timeRangeHours = moment(timeRange.end).diff(timeRange.start, 'hours');

  //
  // Request data from Elasticsearch.
  //

  const bodyBuilder = bodybuilder()
    .size(0)
    .filter('term', 'description.suppressed', false)
    .filter('term', 'description.active', false)
    .filter('range', 'description.event_opened', {
      gte: timeRange.start,
      lt: timeRange.end,
    });

  // Unit incident total count / average turnout duration / unit hour utilization.
  bodyBuilder
    .agg('nested', { path: 'apparatus' }, 'incidents_by_apparatus', a => a
      .agg('terms', 'apparatus.unit_id', { size: 1000 }, 'unit_id', b => b
        .agg('avg', 'apparatus.extended_data.turnout_duration', 'avg_turnout_duration')
        .agg('sum', 'apparatus.extended_data.event_duration', 'sum_event_duration')
      )
    );

  // Unit incident count by category.
  bodyBuilder
    .agg('terms', 'description.category', 'incidents_by_category', a => a
      .agg('nested', { path: 'apparatus' }, 'apparatus', b => b
        .agg('terms', 'apparatus.unit_id', { size: 1000 }, 'unit_id')
      )
    );

  // Send request.
  const esIncidents = await connection.getClient().search({
    index: req.fireDepartment.es_indices['fire-incident'],
    body: bodyBuilder.build(),
  });

  //
  // Organize received data.
  //

  const unitLookups = {
    incidentTotal: {},
    fireIncidentTotal: {},
    emsIncidentTotal: {},
    avgTurnoutDuration: {},
    hourUtilizationPercent: {},
    sumEventDuration: {},
    busyness: {},
  };

  // Unit incident total count / average turnout duration / unit hour utilization.
  for(const bucket of _.get(esIncidents, 'aggregations.incidents_by_apparatus.unit_id.buckets', [])) {
    const unitId = bucket.key;
    const incidentTotal = bucket.doc_count;
    unitLookups.incidentTotal[unitId] = incidentTotal;
    unitLookups.avgTurnoutDuration[unitId] = bucket.avg_turnout_duration.value;
    unitLookups.hourUtilizationPercent[unitId] = (bucket.sum_event_duration.value / 60 / 60 / timeRangeHours) * 100;
    unitLookups.sumEventDuration[unitId] = bucket.sum_event_duration.value;
  }

  // Unit incident count by category.
  for(const bucket of _.get(esIncidents, 'aggregations.incidents_by_category.buckets', [])) {
    const category = bucket.key.toLowerCase();

    for(const unitBucket of _.get(bucket, 'apparatus.unit_id.buckets', [])) {
      const unitId = unitBucket.key;
      const incidentTotal = unitBucket.doc_count;
      if(category === 'fire') {
        unitLookups.fireIncidentTotal[unitId] = incidentTotal;
      } else if(category === 'ems') {
        unitLookups.emsIncidentTotal[unitId] = incidentTotal;
      }
    }
  }

  // Calculate unit busyness.
  const unitSumEventDurationList = Object.keys(unitLookups.sumEventDuration)
    .map(unitId => unitLookups.sumEventDuration[unitId]);
  const quintiles = getUnitBusynessQuintiles(unitSumEventDurationList);

  for(const unitId of Object.keys(unitLookups.sumEventDuration)) {
    const sumEventDuration = unitLookups.sumEventDuration[unitId];
    unitLookups.busyness[unitId] = getUnitBusynessLabel(sumEventDuration, quintiles);
  }

  //
  // Build and send response.
  //

  const apparatus = [];
  for(const unitId of Object.keys(unitLookups.incidentTotal)) {
    apparatus.push({
      unit_id: unitId,
      metrics: {
        unit_hour_utilization: {
          percent: parseFloat(unitLookups.hourUtilizationPercent[unitId]),
        },
        avg_turnout_duration: {
          seconds: parseFloat(unitLookups.avgTurnoutDuration[unitId]),
        },
        busyness: unitLookups.busyness[unitId] || 'n/a',
        responses: {
          total: parseInt(unitLookups.incidentTotal[unitId]),
          fire: parseInt(unitLookups.fireIncidentTotal[unitId]),
          ems: parseInt(unitLookups.emsIncidentTotal[unitId]),
        },
      },
    });
  }

  res.json({ apparatus });
}

export async function getTurnoutLeaderboard(req, res) {
  const interval = (req.query.interval || '').toLowerCase();

  const intervalsAllowed = ['shift', 'day', 'week', 'month', 'quarter', 'year', 'all'];
  if(!intervalsAllowed.includes(interval)) {
    throw new BadRequestError(`Parameter "interval" must be one of the following: ${intervalsAllowed.join(' | ')}`)
  }

  const timeRange = getTimeRange(req.fireDepartment, interval);

  //
  // Request data from Elasticsearch.
  //

  const bodyBuilder = bodybuilder()
    .size(0)
    .filter('term', 'description.suppressed', false)
    .filter('term', 'description.active', false)
    .filter('range', 'description.event_opened', {
      gte: timeRange.start,
      lt: timeRange.end,
    });

  // Unit incident total count / average turnout duration / unit hour utilization.
  bodyBuilder
    .agg('filters', undefined , { 'filters': {
      // calls that opened 2200 to 0559
      'night': { 'query_string': { 'query': 'description.hour_of_day:[ 0 TO 5] OR description.hour_of_day:[22 TO *]' } },
      // calls that opened 0600 to 2159
      'day': { 'query_string': { 'query': 'description.hour_of_day:[6 TO 21]' } },
      // all calls
      'all': { 'query_string': { 'query': 'description.hour_of_day:[0 TO 24]' } }
    } }, a => a
    .agg('nested', { path: 'apparatus' }, 'incidents_by_apparatus', b => b
      .agg('terms', 'apparatus.unit_id', { size: 1000 }, 'unit_id', c => c
          .agg('avg', 'apparatus.extended_data.turnout_duration', 'avg_turnout_duration')
          .agg('percentiles', 'apparatus.extended_data.turnout_duration', 'percentiles_turnout_duration', { percents: [90] }))
      )
    );

  // Send request.
  const esIncidents = await connection.getClient().search({
    index: req.fireDepartment.es_indices['fire-incident'],
    body: bodyBuilder.build(),
  });

  //
  // Organize received data.
  //
  const util = require('util')
  console.log(util.inspect(esIncidents, {showHidden: false, depth: null}))

  const apparatus = [];
  // Total Metrics
  for(const bucket of _.get(esIncidents, 'aggregations.agg_filters_undefined.buckets.all.incidents_by_apparatus.unit_id.buckets', [])) {
    console.dir(bucket);
    apparatus.push({
      unit_id: bucket.key,
      metrics: {
        avg_turnout_duration: {
          seconds: parseFloat(bucket.avg_turnout_duration.value),
        },
        '90th_percentile_turnout_duration': {
          seconds: parseFloat(bucket.percentiles_turnout_duration.values['90.0']),
        },
      },
    });
  }

  for(const bucket of _.get(esIncidents, 'aggregations.agg_filters_undefined.buckets.day.incidents_by_apparatus.unit_id.buckets', [])) {
    let app = _.find(apparatus, a => a.unit_id == bucket.key);
    if (app) {
      _.set(app, 'metrics.day_avg_turnout_duration.seconds', parseFloat(bucket.avg_turnout_duration.value))
      _.set(app, 'metrics.day_90th_percentile_turnout_duration.seconds', parseFloat(bucket.percentiles_turnout_duration.values['90.0']))
    }
  }

  for(const bucket of _.get(esIncidents, 'aggregations.agg_filters_undefined.buckets.night.incidents_by_apparatus.unit_id.buckets', [])) {
    let app = _.find(apparatus, a => a.unit_id == bucket.key);
    if (app) {
      _.set(app, 'metrics.night_avg_turnout_duration.seconds', parseFloat(bucket.avg_turnout_duration.value))
      _.set(app, 'metrics.night_90th_percentile_turnout_duration.seconds', parseFloat(bucket.percentiles_turnout_duration.values['90.0']))
    }
  }


  // Sort with -Infinity/Infinity/NaN at the end.
  apparatus.sort((a, b) => {
    const aSeconds = a.metrics.avg_turnout_duration.seconds;
    const bSeconds = b.metrics.avg_turnout_duration.seconds;
    if(!isFinite(aSeconds) && !isFinite(bSeconds)) {
      return 0;
    } else if(!isFinite(aSeconds)) {
      return 1;
    } else if(!isFinite(bSeconds)) {
      return -1;
    } else {
      return aSeconds - bSeconds;
    }
  });

  res.json({ apparatus });
}

//
// Helpers
//

function getTimeRange(fireDepartment, interval) {
  const now = moment().tz(fireDepartment.timezone);

  if(interval === 'shift') {
    const ShiftConfiguration = FirecaresLookup[fireDepartment.firecares_id];
    const shiftly = new ShiftConfiguration();
    const shiftTimeframe = shiftly.shiftTimeFrame(moment(now).subtract(1, 'day').format());
    return {
      start: shiftTimeframe.start,
      end: shiftTimeframe.end,
    };
  } else if(['day', 'week', 'month', 'quarter', 'year'].includes(interval)) {
    return {
      start: moment(now).subtract(1, `${interval}s`).startOf(interval).format(),
      end: moment(now).startOf(interval).format(),
    };
  } else if(interval === 'all') {
    return {
      start: moment(0).tz(fireDepartment.timezone),
      end: moment(now),
    };
  } else {
    throw new Error(`Interval "${interval}" is not supported.`);
  }
}
