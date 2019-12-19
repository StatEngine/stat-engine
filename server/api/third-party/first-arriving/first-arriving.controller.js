import bodybuilder from 'bodybuilder';

import connection from '../../../elasticsearch/connection';
import { generateAnalysis, generateTextualSummaries } from '../../incident/incident.helpers';

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
