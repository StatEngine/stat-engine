import { calculateTimeRange } from './timeRangeUtils';
import { TimeUnit } from '../components/constants/time-unit';

describe('calculateTimeRange()', function() {
  it('previous shift', function() {
    const tr = calculateTimeRange({
      startDate: '2019-05-02T08:01:00-04:00',
      timeUnit: 'shift',
      firecaresId: '93345',
      previous: true,
    });
    expect(tr.start).to.equal('2019-05-01T08:00:00-04:00');
    expect(tr.end).to.equal('2019-05-02T08:00:00-04:00');
  });

  it('previous rolling week', function() {
    const tr = calculateTimeRange({
      startDate: '2019-05-12T08:01:00-04:00',
      timeUnit: 'week',
      firecaresId: '93345',
      previous: true,
    });
    expect(tr.start).to.equal('2019-05-05T00:00:00-04:00');
    expect(tr.end).to.equal('2019-05-12T00:00:00-04:00');
  });

  it('previous rolling week', function() {
    const tr = calculateTimeRange({
      startDate: '2019-05-03T08:01:00-04:00',
      timeUnit: 'week',
      firecaresId: '93345',
      previous: true,
    });
    expect(tr.start).to.equal('2019-04-26T00:00:00-04:00');
    expect(tr.end).to.equal('2019-05-03T00:00:00-04:00');
  });

  it('previous rolling month', function() {
    const tr = calculateTimeRange({
      startDate: '2019-06-01T08:01:00-04:00',
      timeUnit: 'month',
      firecaresId: '93345',
      previous: true,
    });
    expect(tr.start).to.equal('2019-05-01T00:00:00-04:00');
    expect(tr.end).to.equal('2019-06-01T00:00:00-04:00');
  });

  it('calculates time range (DAY)', function() {
    const tr = calculateTimeRange({
      startDate: '2018-05-16T08:00:00-04:00',
      endDate: '2018-05-17T08:00:00-04:00',
      timeUnit: TimeUnit.Day,
    });
    expect(tr.start).to.equal('2018-05-16T08:00:00-04:00');
    expect(tr.end).to.equal('2018-05-17T08:00:00-04:00');
  });

  it('calculates time range with no end date provided (DAY)', function() {
    const tr = calculateTimeRange({
      startDate: '2018-05-16T10:00:00-04:00',
      timeUnit: TimeUnit.Day,
      firecaresId: '93345',
    });
    expect(tr.start).to.equal('2018-05-16T00:00:00-04:00');
    expect(tr.end).to.equal('2018-05-17T00:00:00-04:00');
  });

  it('calculates time range with no end date provided (WEEK)', function() {
    const tr = calculateTimeRange({
      startDate: '2018-05-16T10:00:00-04:00',
      timeUnit: TimeUnit.Week,
      firecaresId: '93345',
    });
    expect(tr.start).to.equal('2018-05-16T00:00:00-04:00');
    expect(tr.end).to.equal('2018-05-23T00:00:00-04:00');
  });

  it('calculates time range with no end date provided (MONTH)', function() {
    const tr = calculateTimeRange({
      startDate: '2018-05-16T10:00:00-04:00',
      timeUnit: TimeUnit.Month,
      firecaresId: '93345',
    });
    expect(tr.start).to.equal('2018-05-16T00:00:00-04:00');
    expect(tr.end).to.equal('2018-06-16T00:00:00-04:00');
  });
});
