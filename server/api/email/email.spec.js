import { setMergeVars } from './email.controller';
import 'chai/register-should';

describe('setMergeVars()', () => {
  it('should set merge vars', (done) => {
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
          end: '2018-05-17T08:00:00-04:00',
        }
      }
    }

    setMergeVars(req);
  });
});
