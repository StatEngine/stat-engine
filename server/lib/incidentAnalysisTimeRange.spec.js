import 'chai/register-should';
import util from 'util';

import {
  buildFireIncidentQuery,
  previousTimeRange,
  IncidentAnalysisTimeRange
} from './incidentAnalysisTimeRange';

describe('previousTimeRange', () => {
  it('shoud return previous hour', () => {
    const timeRange = {
      start: '2018-05-16T08:00:00-04:00',
      end: '2018-05-16T09:00:00-04:00',
    };

    const tf = previousTimeRange(timeRange);
    tf.start.should.equal('2018-05-16T07:00:00-04:00');
    tf.end.should.equal('2018-05-16T08:00:00-04:00');
  });

  it('shoud return previous day', () => {
    const timeRange = {
      start: '2018-05-16T08:00:00-04:00',
      end: '2018-05-17T08:00:00-04:00',
    };

    const tf = previousTimeRange(timeRange);
    tf.start.should.equal('2018-05-15T08:00:00-04:00');
    tf.end.should.equal('2018-05-16T08:00:00-04:00');
  });

  it('shoud return previous month', () => {
    const timeRange = {
      start: '2018-05-16T08:00:00-04:00',
      end: '2018-06-16T08:00:00-04:00',
    };

    const tf = previousTimeRange(timeRange);
    tf.start.should.equal('2018-04-15T08:00:00-04:00');
    tf.end.should.equal('2018-05-16T08:00:00-04:00');
  });
});


describe('Incident Analysis Time Range', () => {
  it('should construct', () => {
    let analysis = new IncidentAnalysisTimeRange({
      index: 'i1',
      timeRange: { start: '2018-08-01T08:00:00-04:00', end: '2018-08-02T09:00:00-04:00' }
    })
  });

  it('should run query', (done) => {
    let analysis = new IncidentAnalysisTimeRange({
      index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
      timeRange: { start: '2018-07-31T08:00:00-04:00', end: '2018-08-01T08:00:00-04:00' }
    })

    analysis.run()
      .then(results => {
        console.log(util.inspect(results, {showHidden: false, depth: null}))
      });
  });

  it('should build query', () => {
    let timeRange = { start: '2018-04-15T08:00:00-04:00', end: '2018-04-15T09:00:00-04:00' };
  })
});
