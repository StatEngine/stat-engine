import { buildTotalQuery, runTotalQuery } from './unit-metrics.controller';
import 'chai/register-should';
import util from 'util';
import { Log } from '../../util/log';


describe('buildQuery()', () => {
/*  it('should buildQuery', (done) => {
    let req = {};
    buildQuery(req, {}, () => {
      const util = require('util')
      Log.test('req', req)
    })
  });

  it('should runQuey', (done) => {
    let req = {
      params: {
        id: 'E5'
      }
    };
    buildQuery(req, {}, () => {
      Log.test('req', req);

      runQuery(req, {}, (res) => {
        Log.test();
        Log.test();
        Log.test();
        Log.test();
        Log.test('res', res);
      })
    })
  }).timeout(200000); */

  /**
   * Error: buildTotalQuery is not a function
   */
  xit('should runTotalQuery', done => {
    const req = { params: { id: 'E5' } };
    buildTotalQuery(req, {}, () => {
      Log.test('req', req);

      runTotalQuery(req, {}, res => {
        Log.test();
        Log.test();
        Log.test();
        Log.test();
        Log.test('res', res);
      });
    });
  }).timeout(200000);
});
