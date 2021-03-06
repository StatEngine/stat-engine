import moment from 'moment-timezone';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';

export async function getStats(req, res) {
  let fd = req.fireDepartment.get();

  const timeRange = calculateTimeRange({
    startDate: req.query.startDate
      || moment().tz(fd.timezone)
        .format(),
    endDate: req.query.endDate,
    timeUnit: req.query.timeUnit || 'shift',
    firecaresId: fd.firecares_id,
    previous: req.query.previous
  });

  let Analysis = new IncidentAnalysisTimeRange({
    index: fd.es_indices['fire-incident'],
    timeRange,
  });

  const results = await Analysis.compare();

  res.json({
    summary: results,
  });
}

export default getStats;
