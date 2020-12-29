import { expect } from 'chai';

import HtmlReports from './htmlReports';
import config from '../../config/environment';

describe('HtmlReports()', () => {
  it('should throw an exception when report data is missing', () => {
    const htmlReports = new HtmlReports(`${config.mailSettings.emailTemplatePath}/test`);
    const data = null;
    expect(() => htmlReports.report(data)).to.throw();
    // html.should.equal('<div>SHELL<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
  });
  it('should throw an exception when report data is empty', () => {
    const htmlReports = new HtmlReports(`${config.mailSettings.emailTemplatePath}/test`);
    const data = [];
    expect(() => htmlReports.report(data)).to.throw();
    // html.should.equal('<div>SHELL<div><p>PARTIAL TEST1</p></div><div><p>PARTIAL TEST2</p></div></div>');
  });
});
