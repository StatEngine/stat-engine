import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

export function setIndex(req, res, next) {
  req.index = req.user.FireDepartment.get().es_indices['fire-incident'];
  return next();
}

export function buildQuery(req, res, next) {
  req.searchBody = bodybuilder()
    .size(0)
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 10000 }))
    .build();
  next();
}

export function searchUnits(req, res) {
  connection.getClient().search({
    index: req.index,
    body: req.searchBody,
  })
    .then(esRes => {
      let unitBuckets = _.get(esRes, 'aggregations.apparatus["agg_terms_apparatus.unit_id"].buckets');

      if(unitBuckets) {
        return res.send(unitBuckets.map(({ key, doc_count }) => ({ id: key, incidentCount: doc_count })));
      }
      return res.send([]);
    });
}
