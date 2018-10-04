import 'chai/register-should';
import util from 'util';

import {
  buildQuery,
  runQuery,
} from './unit-reports.controller';

describe('buildQuery', () => {
  it('should build query', (done) => {
    let req = { facets: ['category'] };
    buildQuery(req, {}, () => {
      console.log(util.inspect(req.esQuery, { showHidden: false, depth: null }))
      done();
    });
  });

  it('should build and then query', (done) => {
    let req = { facets: ['category'] };
    buildQuery(req, {}, () => {
      console.log(util.inspect(req.esQuery, { showHidden: false, depth: null }))

      runQuery(req, {}).then(res => {
        console.log(util.inspect(res, { showHidden: false, depth: null }))
        done();
      })
    });
  }).timeout(5000);
});
