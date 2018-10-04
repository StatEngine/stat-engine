import { buildQuery, runQuery } from './unit-metrics.controller';
import 'chai/register-should';
import util from 'util';


describe('buildQuery()', () => {
  it('should buildQuery', (done) => {
    let req = {};
    buildQuery(req, {}, () => {
      const util = require('util')
      console.log(util.inspect(req, {showHidden: false, depth: null}))
    })
  });

  it('should runQuey', (done) => {
    let req = {
      params: {
        id: 'E5'
      }
    };
    buildQuery(req, {}, () => {
      console.log(util.inspect(req, {showHidden: false, depth: null}))

      runQuery(req, {}, (res) => {
        console.info();
        console.info();
        console.info();
        console.info();
        console.log(util.inspect(res, {showHidden: false, depth: null}))
      })
    })
  }).timeout(200000);
});
