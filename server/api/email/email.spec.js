import { calculateTimeRange, setMergeVars } from './email.controller';
import { TimeUnit } from '../../components/constants/time-unit';
import 'chai/register-should';

describe('setMergeVars()', () => {
  it('should set merge vars', () => {
    const req = {
      analysis: {
        fireDepartment: {
          incidentCount: { val: 86, previousVal: 111, percentChange: -22.52 },
          emsIncidentCount: { val: 54, previousVal: 78, percentChange: -30.77 },
          fireIncidentCount: { val: 31, previousVal: 33, percentChange: -6.06 },
          responses: { val: 115, previousVal: 170, percentChange: -32.35 },
          responseDurationPercentileRank360: { val: 88.33333333333333, previousVal: 86.01190476190476, percentChange: 2.7 },
          distanceToIncidentPercentile90: { val: 2.4100000000000006, previousVal: 3.7, percentChange: -34.86 },
          turnoutDurationPercentile90: { val: 20.658333778381348, previousVal: 32.349998474121094, percentChange: -36.14 },
          eventDurationPercentile90: { val: 20.658333778381348, previousVal: 32.349998474121094, percentChange: -36.14 }
        },
        unit: {
          E11: {
              incidentCount: { val: 11, previousVal: 9, percentChange: 22.22 },
              transportsCount: { val: 4, previousVal: 3, percentChange: 42 },
              distanceToIncidentSum: { val: 23, previousVal: 3, percentChange: 3 },
          }
        }
      },
      fireDepartment: {
        get: () => { return { name: 'Richmond', firecares_id: '93345', timezone: 'US/Eastern' } }
      },
      reportOptions: {
        logo: 'https://s3/93345.json',
        showDistances: true,
        showTransports: true,
      },
      body: {
        timeRange: {
          start: '2018-05-16T08:00:00-04:00',
          end: '2018-05-19T02:00:00-10:00',
        }
      }
    }

    setMergeVars(req);
  });

  it('should calculate time range', () => {
    const tr = calculateTimeRange({ startDate: '2018-05-16T08:00:00-04:00', endDate: '2018-05-17T08:00:00-04:00'});
    tr.start.should.equal('2018-05-16T08:00:00-04:00');
    tr.end.should.equal('2018-05-17T08:00:00-04:00');
  });

  it('should calculate time range with no end date provided (DAY)', () => {
    const tr = calculateTimeRange({ startDate: '2018-05-16T10:00:00-04:00', timeUnit: TimeUnit.Day, firecaresId: '93345'});
    tr.start.should.equal('2018-05-16T08:00:00-04:00');
    tr.end.should.equal('2018-05-17T08:00:00-04:00');
  });

  it.skip('should calculate time range with no end date provided (WEEK)', () => {
    const tr = calculateTimeRange({ startDate: '2018-05-16T10:00:00-04:00', timeUnit: TimeUnit.Week, firecaresId: '93345'});
    tr.start.should.equal('2018-05-12T08:00:00-04:00');
    tr.end.should.equal('2018-05-19T08:00:00-04:00');
  });

  it.skip('should calculate time range with no end date provided (MONTH)', () => {
    const tr = calculateTimeRange({ startDate: '2018-05-16T10:00:00-04:00', timeUnit: TimeUnit.Month, firecaresId: '93345'});
    tr.start.should.equal('2018-04-30T08:00:00-04:00');
    tr.end.should.equal('2018-05-30T08:00:00-04:00');
  });
});
