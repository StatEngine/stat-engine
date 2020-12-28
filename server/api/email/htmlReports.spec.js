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
    describe('Test EventDurationSumRule & HtmlReports & HandlebarsEmailTemplate', () => {
      let eventDurationSumRuleWithData;
      let htmlReports;
      beforeEach(() => {
        // 1 minute in seconds
        const ruleParams = { threshold: 60 };
        let threshold = ruleParams.threshold;
        const incidents = {
          aggregations: {
            apparatus: {
              'agg_terms_apparatus.unit_id':
                {
                  buckets: [
                    incident('UNIT_000', threshold),
                    incident('UNIT_100', ++threshold),
                    incident('UNIT_200', ++threshold),
                    incident('UNIT_300', ++threshold),
                    incident('UNIT_400', ++threshold),
                    incident('UNIT_1000', ++threshold),
                    incident('UNIT_1100', ++threshold),
                    incident('UNIT_1200', ++threshold),
                    incident('UNIT_1300', ++threshold),
                    incident('UNIT_1400', ++threshold),
                    incident('UNIT_2000', ++threshold),
                    incident('UNIT_2100', ++threshold),
                    incident('UNIT_2200', ++threshold),
                    incident('UNIT_2300', ++threshold),
                  ],
                },
            },
          },
        };
        eventDurationSumRuleWithData = new EventDurationSumRule(ruleParams);
        eventDurationSumRuleWithData.setResults(incidents);

        htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
          handlebars,
          'server/api/email/templates/test/eventDuration/shell.hbs',
          'server/api/email/templates/partials',
        ).template());
      });
      it('should generate Event Duration html report', () => {
        const data = toData(eventDurationSumRuleWithData);
        const html = htmlReports.report(data);
        expect(html).to.equal(fs.readFileSync('server/api/email/test/data/EventDurationHtmlReportV2.html', 'utf-8'));
      });
    });
    describe('Test HtmlReports & HandlebarsEmailTemplate', () => {
      it('should create condensed Email Duration Report', () => {
        const data =
          [
            {
              name: 'alerts',
              content: [
                {
                  rule: 'EventDurationSumRule',
                  level: 'DANGER',
                  description: 'Unit utilization > 1 min',
                  detailList: [
                    { detail: 'UNIT_000/100.00' },
                    { detail: 'UNIT_100/200.00' },
                    { detail: 'UNIT_200/300.00' },
                    { detail: 'UNIT_300/400.00' },
                    { detail: 'UNIT_400/500.00' },
                  ],
                  default_visibility: true,
                  rowColor: '#f2dede',
                  rowBorderColor: '#bb7474',
                },
                {
                  rule: 'EventDurationSumRule',
                  level: 'DANGER',
                  description: 'Unit utilization > 1 min',
                  detailList: [
                    { detail: 'UNIT_1000/100.00' },
                    { detail: 'UNIT_1100/200.00' },
                    { detail: 'UNIT_1200/300.00' },
                    { detail: 'UNIT_1300/400.00' },
                    { detail: 'UNIT_1400/500.00' },
                  ],
                  default_visibility: true,
                  rowColor: '#f2dede',
                  rowBorderColor: '#bb7474',
                },
                {
                  rule: 'EventDurationSumRule',
                  level: 'DANGER',
                  description: 'Unit utilization > 1 min',
                  detailList: [
                    { detail: 'UNIT_2000/100.00' },
                    { detail: 'UNIT_2100/200.00' },
                    { detail: 'UNIT_2200/300.00' },
                    { detail: 'UNIT_2300/400.00' },
                  ],
                  default_visibility: true,
                  rowColor: '#f2dede',
                  rowBorderColor: '#bb7474',
                },
              ],
            },
          ];
        const htmlReport = new HtmlReports(new HandlebarsEmailTemplate(
          handlebars,
          'server/api/email/templates/test/eventDuration/shell.hbs',
          'server/api/email/templates/partials',
        ).template());
        const html = htmlReport.report(data);
        expect(html).to.equal(fs.readFileSync('server/api/email/test/data/EventDurationHtmlReport.html', 'utf-8'));
      });
    });
  });
});

function toData(rule) {
  const analysis = rule.analyze();
  const reportOptions = {};
  return [_formatAlerts([analysis], reportOptions)];
}

function incident(unitName, duration) {
  return {
    'agg_sum_apparatus.extended_data.event_duration': { value: duration }, // in seconds
    key: unitName,
    doc_count: 1,
  };
}