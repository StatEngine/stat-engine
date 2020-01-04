import _ from 'lodash';
import bodybuilder from 'bodybuilder';
import moment from 'moment';

import connection from '../../../elasticsearch/connection';
import { generateAnalysis, generateTextualSummaries } from '../../incident/incident.helpers';
import { getUnitBusynessLabel, getUnitBusynessQuintiles } from '../../../util/statistics';

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
              seconds: apparatus.extended_data.travel_duration,
            },
            turnout: {
              seconds: apparatus.extended_data.turnout_duration,
            },
          },
        };
      }),
      analysis: generateAnalysis(source),
    };
  });

  res.json({
    incidents,
  });
}

export async function getUnitUtilization(req, res) {
  //
  // Request data from Elasticsearch.
  //

  const bodyBuilder = bodybuilder()
    .size(0)
    .filter('term', 'description.suppressed', false)
    .filter('term', 'description.active', false)
    .filter('range', 'description.event_opened', {
      time_zone: req.fireDepartment.timezone,
      gte: moment().subtract(1, 'days').startOf('day').format(),
      lt: moment().startOf('day').format(),
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
    unitLookups.hourUtilizationPercent[unitId] = (bucket.sum_event_duration.value / 60 / 60 / 24) * 100;
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
          percent: unitLookups.hourUtilizationPercent[unitId] || 0,
        },
        avg_turnout_duration: {
          seconds: unitLookups.avgTurnoutDuration[unitId] || 0,
        },
        busyness: unitLookups.busyness[unitId] || 'n/a',
        responses: {
          total: unitLookups.incidentTotal[unitId] || 0,
          fire: unitLookups.fireIncidentTotal[unitId] || 0,
          ems: unitLookups.emsIncidentTotal[unitId] || 0,
        },
      },
    });
  }

  res.json({ apparatus });
}
