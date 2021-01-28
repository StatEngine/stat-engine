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
      it('should create a valid mergeVar', async () => {
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
    });
  });
});
