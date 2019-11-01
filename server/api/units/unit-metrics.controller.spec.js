import { buildTotalQuery, runTotalQuery } from './unit-metrics.controller';
import 'chai/register-should';
import util from 'util';
import { Log } from '../../util/log';


describe('buildQuery()', () => {
/*  it('should buildQuery', (done) => {
    let req = {};
    buildQuery(req, {}, () => {
      const util = require('util')
      Log.info(util.inspect(req, {showHidden: false, depth: null}))
    })
  });

  it('should runQuey', (done) => {
    let req = {
      params: {
        id: 'E5'
      }
    };
    buildQuery(req, {}, () => {
      Log.info(util.inspect(req, {showHidden: false, depth: null}))

      runQuery(req, {}, (res) => {
        Log.info();
        Log.info();
        Log.info();
        Log.info();
        Log.info(util.inspect(res, {showHidden: false, depth: null}))
      })
    })
  }).timeout(200000);*/

    it('should runTotalQuery', (done) => {
      let req = {
        params: {
          id: 'E5'
        }
      };
      buildTotalQuery(req, {}, () => {
        Log.info(util.inspect(req, { showHidden: false, depth: null }))

        runTotalQuery(req, {}, (res) => {
          Log.info();
          Log.info();
          Log.info();
          Log.info();
          Log.info(util.inspect(res, { showHidden: false, depth: null }))
        })
      })
    }).timeout(200000);
});
