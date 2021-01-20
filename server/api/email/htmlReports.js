/**
 * The HTML Report which is emailed to the clients
 */
export default class HtmlReports {
  /**
   * Constructs the HTML Report
   * @param template the main top level shell template
   */
  constructor(template) {
    this.template = template;
  }


  /**
   * Merges reports with a template
   * @param data reports in form of an array
   * @param asObject boolean. if true, then convert data to an object
   * @returns {string} report in html format
   */
  report(data) {
    return this.template(data);
  }
}
