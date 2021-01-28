/* eslint-disable no-undef */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';

import loadJson from '../../../../../server/lib/loadJson';
import comparisonMetricSummary from '../../../../../server/lib/emails/sections/comparisonMetricSummary';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('comparisonMetricSummary', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it.skip('should throw an exception when comparison is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it.skip('should throw an exception when comparison is empty', () => {
        const params = { comparison: {}, reportOptions: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it.skip('should throw an exception when reportOptions is missing', () => {
        const params = { comparison: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it.skip('should throw an exception when reportOptions is empty', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: {} };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid mergeVar', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'agencyIncidentTypeSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        console.dir(comparison);
        
        const params = {
          comparison,
          reportOptions,
          // reportOptions: {
          //   name: 'Daily',
          //   timeUnit: 'shift',
          //   sections: {
          //     showAlertSummary: { FireIncidentEventDurationRule30: false },
          //     showBattalionSummary: true,
          //     showIncidentTypeSummary: false,
          //     showAgencyIncidentTypeSummary: false,
          //   },
          //   showDistances: true,
          //   showTransports: false,
          //   logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93345.png',
          //   to: [
          //     { email: 'mailinglist@test.com' },
          //   ],
          //   schedulerOptions: { later: { text: 'every 5 seconds' } },
          //   showPercentChange: true,
          //   showUtilization: true,
          // },
        };

        const expected = {
          name: 'agencyIncidentTypeSummary',
          agencyIncidentTypeMetrics: [],
        };

        const mergeVar = await agencyIncidentTypeSummary(params);
        expect(mergeVar).to.equal(expected);
      });
    });
  });
});
