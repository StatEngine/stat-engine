import bodybuilder from 'bodybuilder';
import _ from 'lodash';
import moment from 'moment-timezone';

import connection from '../../elasticsearch/connection';

function getIncidentIndex(req) {
  return req.user.FireDepartment.get().es_indices['fire-incident'];
}

function getApparatusIndex(req) {
  return req.user.FireDepartment.get().es_indices['apparatus-fire-incident'];
}

export async function getUnits(req, res) {
  const searchBody = bodybuilder()
    .size(0)
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 10000 }, unitAggr => unitAggr
        .aggregation('terms', 'apparatus.station', { size: 10000 })
        .aggregation('terms', 'apparatus.unit_type', { size: 10000 })
      )
    )
    .build();

  const esRes = await connection.getClient().search({
    index: getIncidentIndex(req),
    body: searchBody,
  });

  let unitBuckets = _.get(esRes, 'aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets');

  if (unitBuckets) {
    const response = unitBuckets
      .map(({ key, doc_count, ...rest }) => {
        const typeBucket = rest['agg_terms_apparatus.unit_type'].buckets;
        const stationBucket = rest['agg_terms_apparatus.station'].buckets;

        if (typeBucket && typeBucket.length && stationBucket && stationBucket.length) {
          return {
            id: key,
            incidentCount: doc_count,
            unit_type: typeBucket[0].key,
            station: stationBucket[0].key
          };
        } else {
          return null;
        }
      })
      .filter(response => response);

    return res.send(response);
  }

  return res.send([]);
}

export async function getAvailableUnits(req, res) {
  let fd = req.user.FireDepartment.get();
  const now = moment().tz(fd.timezone).format();
  const date = req.query.datetime || now;

  const searchBody = bodybuilder()
    .size(0)
    .rawOption('_source', [
      'apparatus_data.unit_id',
      'apparatus_data.unit_status.*'
    ])
    .filter('range', 'apparatus_data.dispatched.timestamp', { gte: date })
    .filter('bool', b => b
      .orFilter('range', 'apparatus_data.cleared.timestamp', { let: date })
      .orFilter('range', 'apparatus_data.available.timestamp', { let: date })
     )
    .aggregation('terms', 'apparatus_data.unit_id');
  
  const esRes = await connection.getClient().search({
    index: getApparatusIndex(req),
    body: searchBody
  });

  try {
    const units = esRes.hits.hits.map(hit => hit._source.apparatus_data);
    return res.send(units);
  } catch (err) {
    console.error(err);
    return res.send([]);
  }
}
