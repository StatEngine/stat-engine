import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

function getIncidentIndex(req) {
  return req.user.FireDepartment.get().es_indices['fire-incident'];
}

export function getUnits(req, res) {
  const searchBody = bodybuilder()
    .size(0)
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 10000 }))
    .build();

  connection.getClient().search({
    index: getIncidentIndex(req),
    body: searchBody,
  })
    .then(esRes => {
      let unitBuckets = _.get(esRes, 'aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets');

      if(unitBuckets) {
        return res.send(unitBuckets.map(({ key, doc_count }) => ({ id: key, incidentCount: doc_count })));
      }
      return res.send([]);
    });
}
