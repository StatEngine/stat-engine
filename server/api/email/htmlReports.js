import Handlebars from 'handlebars';
import fs from 'fs';

/**
 * Represents HTML Report which is emailed to the clients
 */
export default class HtmlReports {
  constructor(templatePath) {
    this.templatePath = templatePath;
  }

  /**
   * Merges reports with a template
   * @param data reports in form of an array
   * @returns {string} report in html foramt
   */
  report(data) {
    loadPartials(this.templatePath);
    const compiledTemplate = shellTemplate(this.templatePath);
    return compiledTemplate(fromArrayToObject(data));
  }
}

/**
 * Load all partial templates into Handlebars framework
 *
 * @param templatePath root location of all the templates
 */
function loadPartials(templatePath) {
  const files = fs.readdirSync(`${templatePath}/partials`);
  files.forEach(fileName => {
    loadPartial(templatePath, fileName);
  });
}

/**
 * Load a partial template into Handlebars framework
 *
 * @param templatePath root location of all templates
 * @param fileName file name of the partial template
 */
function loadPartial(templatePath, fileName) {
  const path = `${templatePath}/partials/${fileName}`;
  const sourcePartial = fs.readFileSync(path, 'utf-8');
  const partialName = fileName.split('.')[0];
  Handlebars.registerPartial(partialName, sourcePartial);
}

/**
 * Convert array reports to object
 *
 * @param data reports in form of an array
 * @returns {*} reports in the form of an object
 */
function fromArrayToObject(data) {
  return data.reduce((acc, mergeVar) => {
    acc[mergeVar.name] = mergeVar.content;
    return acc;
  }, {});
}

/**
 * Compiles the main shell template
 *
 * @param templatePath root location of all the templates
 * @returns {HandlebarsTemplateDelegate<any>} compiled template
 */
function shellTemplate(templatePath) {
  const template = fs.readFileSync(`${templatePath}/shell.hbs`, 'utf-8');
  return Handlebars.compile(template);
}

