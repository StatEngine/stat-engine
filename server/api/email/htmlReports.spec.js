/* eslint-disable no-undef */
import { expect } from 'chai';
import handlebars from 'handlebars';
import fs from 'fs';
import HtmlReports from './htmlReports';
import { EventDurationSumRule } from '../../lib/rules/eventDurationSumRule';
import { _formatAlerts } from './sendNotificationController';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';


describe('HtmlReports', () => {
  describe('fundamental tests', () => {
    describe('error path tests', () => {
      it('should throw an exception when report data is missing', () => {
        const htmlReports = new HtmlReports();
        const data = null;
        expect(() => htmlReports.report(data)).to.throw();
      });
      it('should throw an exception when report data is empty', () => {
        const htmlReports = new HtmlReports();
        const data = [];
        expect(() => htmlReports.report(data)).to.throw();
      });
    });
    describe('happy path tests', () => {
      it('should merge partials to form a report', () => {
        const data = [{}];
        const html = new HtmlReports(new HandlebarsEmailTemplate(
          handlebars,
          'server/api/email/templates/test/base/shell.hbs',
          'server/api/email/templates/test/base/partials',
        ).template()).report(data);
        expect(html).to.equal('<div>SHELL<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
      });
    });
  });
  describe('Event Duration Report', () => {
    let eventDurationSumRuleWithData;
    beforeEach(() => {
      // 1 minute in seconds
      const ruleParams = { threshold: 60 };
      const incidentOne = {
        'agg_sum_apparatus.extended_data.event_duration': { value: ruleParams.threshold * 10 }, // in seconds
        key: 'UNIT_100', // unit ID
        doc_count: 1,
      };
      const incidentTwo = {
        'agg_sum_apparatus.extended_data.event_duration': { value: ruleParams.threshold * 100 }, // in seconds
        key: 'UNIT_200', // unit ID
        doc_count: 4, // 4 units responded
      };
      const twoIncidentOverThreshold = { aggregations: { apparatus: { 'agg_terms_apparatus.unit_id': { buckets: [incidentOne, incidentTwo] } } } };
      eventDurationSumRuleWithData = new EventDurationSumRule(ruleParams);
      eventDurationSumRuleWithData.setResults(twoIncidentOverThreshold);
    });
    it('should generate Event Duration html report', () => {
      const dataIn = data(eventDurationSumRuleWithData);

      console.log(JSON.stringify(dataIn));

      const html = new HtmlReports(new HandlebarsEmailTemplate(
        handlebars,
        'server/api/email/templates/test/eventDuration/shell.hbs',
        'server/api/email/templates/partials',
      ).template())
        .report(dataIn);

      expect(html).to.equal(fs.readFileSync('server/api/email/test/data/EventDurationHtmlReport.html', 'utf-8'));
    });
  });
});

function data(rule) {
  const analysis = rule.analyze();
  const reportOptions = {};
  return [_formatAlerts([analysis], reportOptions)];
}
