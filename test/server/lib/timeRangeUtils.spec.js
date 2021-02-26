import 'chai/register-should';

import { calculateTimeRange } from '../../../server/lib/timeRangeUtils';

describe('calculateTimeRange', () => {
  it('previous shift', () => {
    const tr = calculateTimeRange({
      startDate: '2019-05-02T08:01:00-04:00',
      timeUnit: 'shift',
      firecaresId: '93345',
      previous: true,
    });
    tr.start.should.equal('2019-05-01T08:00:00-04:00');
    tr.end.should.equal('2019-05-02T08:00:00-04:00');
  });

  it('previous rolling week', () => {
    const tr = calculateTimeRange({
      startDate: '2019-05-12T08:01:00-04:00',
      timeUnit: 'week',
      firecaresId: '93345',
      previous: true,
    });
    tr.start.should.equal('2019-05-05T00:00:00-04:00');
    tr.end.should.equal('2019-05-12T00:00:00-04:00');
  });

  it('previous rolling week', () => {
    const tr = calculateTimeRange({
      startDate: '2019-05-03T08:01:00-04:00',
      timeUnit: 'week',
      firecaresId: '93345',
      previous: true,
    });
    tr.start.should.equal('2019-04-26T00:00:00-04:00');
    tr.end.should.equal('2019-05-03T00:00:00-04:00');
  });

  it('previous rolling month', () => {
    const tr = calculateTimeRange({
      startDate: '2019-06-01T08:01:00-04:00',
      timeUnit: 'month',
      firecaresId: '93345',
      previous: true,
    });
    tr.start.should.equal('2019-05-01T00:00:00-04:00');
    tr.end.should.equal('2019-06-01T00:00:00-04:00');
  });
});
