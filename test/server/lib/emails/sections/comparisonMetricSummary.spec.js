/* eslint-disable no-undef */
import { expect } from 'chai';
import loadJson from '../../../../../server/lib/loadJson';
import comparisonMetricSummary from '../../../../../server/lib/emails/sections/comparisonMetricSummary';

describe('comparisonMetricSummary', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it('should throw an exception when comparison is missing', () => {
        const params = { reportOptions: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when comparison is empty', () => {
        const params = { comparison: {}, reportOptions: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when reportOptions is missing', () => {
        const params = { comparison: { foo: 'bar' } };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when reportOptions is empty', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: {} };
        const type = 'agencyIncidentType';
        expect(() => comparisonMetricSummary(type, params)).to.throw('Missing comparison or reportOptions');
      });
      it('should throw an exception when type is unsupported', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: { yar: 'barlog' } };
        const type = 'baz';
        expect(() => comparisonMetricSummary(type, params)).to.throw('No metric config for metric type: baz');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid mergeVar for agencyIncidentType', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'agencyIncidentTypeSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'agencyIncidentTypeSummary',
          agencyIncidentTypeMetrics: [],
        };

        const mergeVar = comparisonMetricSummary('agencyIncidentType', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it('should create a valid mergeVar for agencyResponses', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'agencyResponsesSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockAgencyResponsesMergeVar = 'agencyResponsesSummaryMergeVar.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockAgencyResponsesMergeVar);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = comparisonMetricSummary('agencyResponses', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it('should create a valid mergeVar for battalion', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'battalionSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockBattalionSummaryMergeVarFileName = 'battalionSummaryMergeVar.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockBattalionSummaryMergeVarFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = comparisonMetricSummary('battalion', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it('should create a valid mergeVar for incidentType', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'incidentTypeSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockIncidentTypeSumaryMergeVarFileName = 'incidentTypeSummaryMergeVar.mock.json';

        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockIncidentTypeSumaryMergeVarFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = comparisonMetricSummary('incidentType', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it('should create a valid mergeVar for jurisdiction', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'jurisdictionSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockJurisdictionSummaryMergeVarFileName = 'jurisdictionSummaryMergeVar.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockJurisdictionSummaryMergeVarFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = comparisonMetricSummary('jurisdiction', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it('should create a valid mergeVar for unit', () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'unitSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const mockUnitSummaryMergeVarFileName = 'unitSummaryMergeVar.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);
        const expected = loadJson(mockDataPath, mockUnitSummaryMergeVarFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const mergeVar = comparisonMetricSummary('unit', params);

        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
