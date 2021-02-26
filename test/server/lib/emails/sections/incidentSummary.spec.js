/* eslint-disable no-undef */
import { expect } from 'chai';
import loadJson from '../../../../../server/lib/loadJson';
import incidentSummary from '../../../../../server/lib/emails/sections/incidentSummary';

describe('incidentSummary', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it('should throw an exception when comparison is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        expect(() => incidentSummary(params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when comparison is empty', () => {
        const params = { comparison: {}, reportOptions: { foo: 'bar' } };
        expect(() => incidentSummary(params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when reportOptions is missing', () => {
        const params = { comparison: { foo: 'bar' } };
        expect(() => incidentSummary(params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when reportOptions is empty', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: {} };
        expect(() => incidentSummary(params)).to.throw('Missing comparison or reportOptions');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid mergeVar for incidentSummary', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'alertSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockIncidentSummaryMergeVarFileName = 'incidentSummaryMergeVar.mock.json';

        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockIncidentSummaryMergeVarFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = incidentSummary(params);

        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
