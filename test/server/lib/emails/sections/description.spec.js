/* eslint-disable no-undef */
import { expect } from 'chai';
import moment from 'moment-timezone';

import loadJson from '../../../../../server/lib/loadJson';
import description from '../../../../../server/lib/emails/sections/description';

describe('description', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it.skip('should throw an exception when ruleAnalysis is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid json for description', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockFireDepartmentFileName = 'fireDepartment.mock.json';
        const mockTimeRangeFileName = 'timeRange.mock.json';
        const mockAnalysisFileName = 'analysis.mock.json';
        const mockOptionsFileName = 'alertSummaryOptions.mock.json';
        const mockDescriptionFileName = 'description.mock.json';

        const fireDepartment = loadJson(mockDataPath, mockFireDepartmentFileName);
        const timeRange = loadJson(mockDataPath, mockTimeRangeFileName);
        const analysis = loadJson(mockDataPath, mockAnalysisFileName);
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const expected = loadJson(mockDataPath, mockDescriptionFileName);
        expected.runTime = moment()
          .tz(fireDepartment.timezone)
          .format('lll');

        const mergeVar = await description(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);

        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
