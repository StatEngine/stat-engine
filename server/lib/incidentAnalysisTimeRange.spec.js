import { previousTimeRange } from './incidentAnalysisTimeRange';

describe('incidentAnalysisTimeRange', function() {
  describe('previousTimeRange()', function() {
    it('shoud return previous hour', function() {
      const timeRange = {
        start: '2018-05-16T08:00:00-04:00',
        end: '2018-05-16T09:00:00-04:00',
      };

      const tf = previousTimeRange(timeRange);
      expect(tf.start).to.equal('2018-05-16T07:00:00-04:00');
      expect(tf.end).to.equal('2018-05-16T08:00:00-04:00');
    });

    it('shoud return previous day', () => {
      const timeRange = {
        start: '2018-05-16T08:00:00-04:00',
        end: '2018-05-17T08:00:00-04:00',
      };

      const tf = previousTimeRange(timeRange);
      expect(tf.start).to.equal('2018-05-15T08:00:00-04:00');
      expect(tf.end).to.equal('2018-05-16T08:00:00-04:00');
    });

    it('shoud return previous month', () => {
      const timeRange = {
        start: '2018-05-16T08:00:00-04:00',
        end: '2018-06-16T08:00:00-04:00',
      };

      const tf = previousTimeRange(timeRange);
      expect(tf.start).to.equal('2018-04-15T08:00:00-04:00');
      expect(tf.end).to.equal('2018-05-16T08:00:00-04:00');
    });
  });

  // describe('IncidentAnalysisTimeRange', function() {
  //   it('succeeds when running analysis', async function() {
  //     const analysis = new IncidentAnalysisTimeRange({
  //       index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
  //       timeRange: {
  //         start: '2018-07-31T08:00:00-04:00',
  //         end: '2018-08-01T08:00:00-04:00',
  //       },
  //     });
  //
  //     await expect(analysis.ruleAnalysis()).not.to.be.rejected;
  //   });
  // });
});
