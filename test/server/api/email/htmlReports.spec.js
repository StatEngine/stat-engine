/* eslint-disable no-undef */
import { expect } from 'chai';
import handlebars from 'handlebars';
import HtmlReports from '../../../../server/api/email/htmlReports';
import HandlebarsEmailTemplate from '../../../../server/api/email/templates/handlebarsEmailTemplate';

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
          'test/server/api/email/test-data/shell.hbs',
          'test/server/api/email/test-data/partials',
        ).template()).report(data);
        expect(html).to.equal('<div>SHELL<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
      });
    });
  });
});

