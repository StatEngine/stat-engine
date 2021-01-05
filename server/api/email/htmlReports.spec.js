/* eslint-disable no-undef */
import { expect } from 'chai';
import handlebars from 'handlebars';
import fs from 'fs';
import HtmlReports from './htmlReports';
import { EventDurationSumRule } from '../../lib/rules/eventDurationSumRule';
import { _formatAlerts } from './sendNotificationController';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';


describe('HtmlReports()', () => {
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
  it('should generate html report', () => {
    const data = [{}];
    const html = new HtmlReports(new HandlebarsEmailTemplate(
      handlebars,
      'server/api/email/templates/test/base/shell.hbs',
      'server/api/email/templates/test/base/partials',
    ).template()).report(data);
    expect(html).to.equal('<div>SHELL<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
  });
  describe('Event Duration Report', () => {
    let rule;
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
      rule = new EventDurationSumRule(ruleParams);
      rule.setResults(twoIncidentOverThreshold);
    });
    it('should generate Event Duration html report', () => {
      const analysis = rule.analyze();
      const reportOptions = {};
      const globalMergeVars = [_formatAlerts([analysis], reportOptions)];

      const html = new HtmlReports(new HandlebarsEmailTemplate(
        handlebars,
        'server/api/email/templates/test/eventDuration/shell.hbs',
        'server/api/email/templates/partials',
      ).template())
        .report(globalMergeVars);

      expect(html).to.equal(fs.readFileSync('server/api/email/test/data/EventDurationHtmlReport.html', 'utf-8'));
    });
  });
});
