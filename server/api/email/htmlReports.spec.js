import { expect } from 'chai';
import HtmlReports from './htmlReports';
import config from '../../config/environment';

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
  it('should generate Event Duration html report', () => {
    const htmlReports = new HtmlReports('server/api/email/templates/test/eventDuration/shell.hbs', 'server/api/email/templates/partials');
    const data = [{}];
    const html = htmlReports.report(data);
    console.log(html);
    // expect(html).to.equal('<div>This is a shell template<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
  });
});
