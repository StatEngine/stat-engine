import connection from '../../elasticsearch/connection';
import bodybuilder from 'bodybuilder';
import _ from 'lodash';

export function generateUnitReport(req, res) {
  res.send({ sample: 'ere' });
}

export function buildQuery(req, res, next) {
  req.searchBody = bodybuilder()
    .size(0)
    .aggregation('nested', { path: 'apparatus' }, 'apparatus', agg => agg
      .aggregation('terms', 'apparatus.unit_id', { size: 10000 }))
    .build();
  next();
}

export function loadUnit(req, res, next) {
  next()
}
