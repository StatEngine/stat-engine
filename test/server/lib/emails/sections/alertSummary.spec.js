/* eslint-disable no-undef */
import { expect } from 'chai';
import loadJson from '../../../../../server/lib/loadJson';
import alertSummary from '../../../../../server/lib/emails/sections/alertSummary';

describe('alertSummary', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it.skip('should throw an exception when ruleAnalysis is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        expect(() => alertSummary(params)).to.throw('Missing ruleAnalysis or reportOptions');
      });
      it.skip('should throw an exception when ruleAnalysis is empty', () => {
        const params = { ruleAnalysis: {}, reportOptions: { foo: 'bar' } };
        expect(() => alertSummary(params)).to.throw('Missing ruleAnalysis or reportOptions');
      });
      it.skip('should throw an exception when reportOptions is missing', () => {
        const params = { ruleAnalysis: { foo: 'bar' } };
        expect(() => alertSummary(params)).to.throw('Missing ruleAnalysis or reportOptions');
      });
      it.skip('should throw an exception when reportOptions is empty', () => {
        const params = { ruleAnalysis: { foo: 'bar' }, reportOptions: {} };
        expect(() => alertSummary(params)).to.throw('Missing ruleAnalysis or reportOptions');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid mergeVar for alerts', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'alertSummaryOptions.mock.json';
        const mockRuleAnalysisFileName = 'ruleAnalysis.mock.json';
        const mockAlertsMergeVarFileName = 'alertSummaryMergeVar.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const ruleAnalysis = loadJson(mockDataPath, mockRuleAnalysisFileName);
        const expected = loadJson(mockDataPath, mockAlertsMergeVarFileName);
        const params = {
          ruleAnalysis,
          reportOptions,
        };

        const mergeVar = await alertSummary(params);
        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
