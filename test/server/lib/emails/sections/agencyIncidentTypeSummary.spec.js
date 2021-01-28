/* eslint-disable no-undef */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fs from 'fs';

import loadJson from '../../../../../server/lib/loadJson';
import agencyIncidentTypeSummary from '../../../../../server/lib/emails/sections/agencyIncidentTypeSummary';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('agencyIncidentTypeSummary', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it.skip('should throw an exception when comparison is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        expect(() => agencyIncidentTypeSummary(params)).to.eventually.equal('Missing comparison or reportOptions');
      });
      it.skip('should throw an exception when comparison is empty', () => {
        const params = { comparison: {}, reportOptions: { foo: 'bar' } };
        expect(() => agencyIncidentTypeSummary(params)).to.throw();
      });
      it.skip('should throw an exception when reportOptions is missing', () => {
        const params = { comparison: { foo: 'bar' } };
        expect(() => agencyIncidentTypeSummary(params)).to.throw();
      });
      it.skip('should throw an exception when reportOptions is empty', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: {} };
        expect(async () => { agencyIncidentTypeSummary(params); }).to.throw();
      });
    });
    describe.skip('happy path tests', () => {
      it('should create a valid mergeVar', async () => {
        const mockDataPath = './mocks';
        const rawData = fs.readFileSync('test/server/lib/emails/sections/mocks/agencyIncidentTypeSummaryOptions.mock.json', 'utf-8'); // loadJson(mockDataPath, 'agencyIncidentTypeSummaryOptions.mock.json');
        const reportOptions = JSON.parse(rawData);
        console.dir(reportOptions);

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
