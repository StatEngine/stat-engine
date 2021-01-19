import { buildTimeFilter } from './stats.controller';
import { FirecaresLookup } from '@statengine/shiftly';
import 'chai/register-should';

describe('buildTimeFilter()', () => {
  /**
   * Integration test - skip
   */
  xit('should throw error when not shiftly not provided', done => {
    try {
      buildTimeFilter(undefined, 'daily', '2018-05-17');
    } catch (e) {
      done();
    }
  });

  /**
   * Error:      TypeError: (0 , _stats.buildTimeFilter) is not a function
   */
  xit('should correctly build daily filter based on shift', () => {
    const filter = buildTimeFilter(FirecaresLookup['93345'], 'daily', '2018-05-17');
    filter.start.should.equal('2018-05-16T08:00:00-04:00');
    filter.end.should.equal('2018-05-17T08:00:00-04:00');
  });
});
