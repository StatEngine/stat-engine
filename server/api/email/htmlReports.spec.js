/* eslint-disable no-undef */
import { expect } from 'chai';
import HtmlReports from './htmlReports';
import { EventDurationSumRule } from '../../lib/rules/eventDurationSumRule';
import { _formatAlerts } from './sendNotificationController';


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
    const htmlReports = new HtmlReports('server/api/email/templates/test/base/shell.hbs', 'server/api/email/templates/test/base/partials');
    const data = [{}];
    const html = htmlReports.report(data);
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
      const htmlReports = new HtmlReports(
        'server/api/email/templates/test/eventDuration/shell.hbs',
        'server/api/email/templates/partials',
      );
      const html = htmlReports.report(globalMergeVars);
      console.log(html);
      expect(html).to.equal('<div>This is a shell template\n' +
        '  <div><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">\n' +
        '  <!--[if gte mso 9]>\n' +
        '  <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">\n' +
        '  <![endif]-->\n' +
        '  <tbody class="mcnBoxedTextBlockOuter">\n' +
        '  <tr>\n' +
        '    <td valign="top" class="mcnBoxedTextBlockInner">\n' +
        '      <!--[if gte mso 9]>\n' +
        '      <td align="center" valign="top" ">\n' +
        '      <![endif]-->\n' +
        '      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;"\n' +
        '             class="mcnBoxedTextContentContainer">\n' +
        '        <tbody>\n' +
        '        <tr>\n' +
        '          <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">\n' +
        '            <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%"\n' +
        '                   style="min-width: 100% !important;background-color: #616161;">\n' +
        '              <tbody>\n' +
        '              <tr>\n' +
        '                <td valign="top" class="mcnTextContent"\n' +
        '                    style="padding: 18px;color: #F2F2F2;font-family: Helvetica;font-size: 24px;font-weight: normal;text-align: center;">\n' +
        '                  <div style="text-align: center;"><strong>Notifications</strong></div>\n' +
        '                </td>\n' +
        '              </tr>\n' +
        '              </tbody>\n' +
        '            </table>\n' +
        '          </td>\n' +
        '        </tr>\n' +
        '        </tbody>\n' +
        '      </table>\n' +
        '      <!--[if gte mso 9]>\n' +
        '      </td>\n' +
        '      <![endif]-->\n' +
        '      <!--[if gte mso 9]>\n' +
        '      </tr>\n' +
        '      </table>\n' +
        '      <![endif]-->\n' +
        '    </td>\n' +
        '  </tr>\n' +
        '  </tbody>\n' +
        '</table>\n' +
        '<table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">\n' +
        '  <tbody class="mcnTextBlockOuter">\n' +
        '  <tr>\n' +
        '    <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">\n' +
        '      <!--[if mso]>\n' +
        '      <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">\n' +
        '        <tr>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso]>\n' +
        '      <td valign="top" width="598" style="width:598px;">\n' +
        '      <![endif]-->\n' +
        '      <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;"\n' +
        '             width="100%" class="mcnTextContentContainer">\n' +
        '        <tbody>\n' +
        '        <tr>\n' +
        '          <td valign="top" class="mcnTextContent"\n' +
        '              style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">\n' +
        '            <table style="width:100%">\n' +
        '              <tbody>\n' +
        '              <tr>\n' +
        '                <th style="text-align: left;"><span style="font-size:16px"><span style="color:#000000"><strong>Description</strong></span></span>\n' +
        '                </th>\n' +
        '                <th style="text-align: left;"><span style="font-size:14px"><span\n' +
        '                        style="color:#000000"><strong>Details</strong></span></span>\n' +
        '                </th>\n' +
        '              </tr>\n' +
        '                <tr style="background-color: #f2dede">\n' +
        '                  <td>\n' +
        '                    <span style="font-size:14px;">Unit utilization &gt; 1 min</span>\n' +
        '                  </td>\n' +
        '                  <td>\n' +
        '                    <span style="font-size:14px;">Unit: UNIT_100, Utilization: 10.00</span>\n' +
        '                  </td>\n' +
        '                </tr>\n' +
        '                <tr style="background-color: #f2dede">\n' +
        '                  <td>\n' +
        '                    <span style="font-size:14px;">Unit utilization &gt; 1 min</span>\n' +
        '                  </td>\n' +
        '                  <td>\n' +
        '                    <span style="font-size:14px;">Unit: UNIT_200, Utilization: 100.00</span>\n' +
        '                  </td>\n' +
        '                </tr>\n' +
        '              </tbody>\n' +
        '            </table>\n' +
        '          </td>\n' +
        '        </tr>\n' +
        '        </tbody>\n' +
        '      </table>\n' +
        '      <!--[if mso]>\n' +
        '      </td>\n' +
        '      <![endif]-->\n' +
        '      <!--[if mso]>\n' +
        '      </tr>\n' +
        '      </table>\n' +
        '      <![endif]-->\n' +
        '    </td>\n' +
        '  </tr>\n' +
        '  </tbody>\n' +
        '</table>\n' +
        '</div>\n' +
        '</div>\n');
    });
  });
});
