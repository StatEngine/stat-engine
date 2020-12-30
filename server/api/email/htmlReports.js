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
   * @returns {string} report in html format
   */
  report(data) {
    return this.template(fromArrayToObject(data));
  }
}

/**
 * Convert array reports to object
 *
 * @param data reports in form of an array
 * @returns {*} reports in the form of an object
 */
function fromArrayToObject(data) {
  if (!data || data.length === 0) {
    throw new Error('Data must be provided');
  }
  return data.reduce((acc, mergeVar) => {
    acc[mergeVar.name] = mergeVar.content;
    return acc;
  }, {});
}

