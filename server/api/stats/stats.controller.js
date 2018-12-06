import _ from 'lodash';

import { FirecaresLookup } from '@statengine/shiftly';
import moment from 'moment-timezone';
import Promise from 'bluebird';
import connection from '../../elasticsearch/connection';
import { calculateTimeRange } from '../../lib/timeRangeUtils';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';

export function getStats(req, res) {
  let fd = req.fireDepartment.get();

  const timeRange = calculateTimeRange({
    startDate: req.query.startDate || moment().tz(fd.timezone).format(),
    endDate: req.query.endDate,
    timeUnit: req.query.timeUnit || 'shift',
    firecaresId: fd.firecares_id,
    previous: req.query.previous
  });

  console.dir(timeRange)


  let Analysis = new IncidentAnalysisTimeRange({
    index: fd.es_indices['fire-incident'],
    timeRange,
  });

  Analysis.compare()
    .then(results => {
      res.json({
        summary: results,
      })

    })
    .catch(e => res.send(500));
}
