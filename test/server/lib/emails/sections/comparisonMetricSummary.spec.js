/* eslint-disable no-undef */
import { expect } from 'chai';
import loadJson from '../../../../../server/lib/loadJson';
import comparisonMetricSummary from '../../../../../server/lib/emails/sections/comparisonMetricSummary';

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
      it.skip('should throw an exception when type is unsupported', () => {
        const params = { comparison: { foo: 'bar' }, reportOptions: { yar: 'barlog' } };
        const type = 'baz';
        expect(() => comparisonMetricSummary(type, params)).to.throw('No metric config for metric type: baz');
      });
    });
    describe('happy path tests', () => {
      it('should create a valid mergeVar for agencyIncidentType', async () => {
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

        const mergeVar = await comparisonMetricSummary('agencyIncidentType', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it.skip('should create a valid mergeVar for agencyResponses', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'agencyResponsesSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'agencyResponsesSummary',
          agencyResponsesMetrics: [],
        };

        const mergeVar = await comparisonMetricSummary('agencyResponses', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it.skip('should create a valid mergeVar for battalion', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'battalionSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'battalionSummary',
          battalionMetrics: [],
        };

        const mergeVar = await comparisonMetricSummary('battalion', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it.skip('should create a valid mergeVar for incidentType', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'incidentTypeSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'incidentTypeSummary',
          incidentTypeMetrics: [],
        };

        const mergeVar = await comparisonMetricSummary('incidentType', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it.skip('should create a valid mergeVar for jurisdiction', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'jurisdictionSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'jurisdictionSummary',
          jurisdictionMetrics: [],
        };

        const mergeVar = await comparisonMetricSummary('jurisdiction', params);

        expect(mergeVar).to.deep.equal(expected);
      });

      it.skip('should create a valid mergeVar for unit', async () => {
        const mockDataPath = 'test/server/lib/emails/sections/mocks';
        const mockOptionsFileName = 'unitSummaryOptions.mock.json';
        const mockComparisonFileName = 'comparison.mock.json';
        const reportOptions = loadJson(mockDataPath, mockOptionsFileName);
        const comparison = loadJson(mockDataPath, mockComparisonFileName);

        const params = {
          comparison,
          reportOptions,
        };

        const expected = {
          name: 'unitSummary',
          unitMetrics: [],
        };

        const mergeVar = await comparisonMetricSummary('unit', params);

        expect(mergeVar).to.deep.equal(expected);
      });
    });
  });
});
