/* eslint-disable no-undef */
import { expect } from 'chai';
import moment from 'moment-timezone';

import loadJson from '../../../../../server/lib/loadJson';
import descriptionSection from '../../../../../server/lib/emails/sections/description';

describe('description', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it('should throw an exception when any of the params is missing or empty', () => {
        const fireDepartment = {};
        const timeRange = {};
        const analysis = {};
        let reportOptions;
        expect(() =>
          descriptionSection(
            fireDepartment,
            timeRange,
            analysis.previousTimeFilter,
            reportOptions,
          )).to.throw('Missing or empty parameters passed to description');
      });
    });
    describe.skip('happy path tests', () => {
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

        const mergeVar = descriptionSection(fireDepartment, timeRange, analysis.previousTimeFilter, reportOptions);

        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
