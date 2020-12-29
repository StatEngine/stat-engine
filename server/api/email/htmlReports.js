import Handlebars from 'handlebars';
import fs from 'fs';
import { Log } from '../../util/log';


/**
 * Represents HTML Report which is emailed to the clients
 */
export default class HtmlReports {
  constructor(shellTemplatePath, partialsTemplateLocation) {
    this.shellTemplatePath = shellTemplatePath;
    this.patialsTemplateLocation = partialsTemplateLocation;
    Log.debug('Shell template', this.shellTemplatePath);
    Log.debug('Partials template', this.patialsTemplateLocation);
  }


  /**
   * Merges reports with a template
   * @param data reports in form of an array
   * @returns {string} report in html foramt
   */
  report(data) {
    loadPartials(this.patialsTemplateLocation);
    const compiledTemplate = shellTemplate(this.shellTemplatePath);
    return compiledTemplate(fromArrayToObject(data));
  }
}

/**
 * Load all partial templates into Handlebars framework
 *
 * @param partialsTemplateLocation root location of all the templates
 */
function loadPartials(partialsTemplateLocation) {
  const files = fs.readdirSync(partialsTemplateLocation);
  files.forEach(fileName => {
    loadPartial(`${partialsTemplateLocation}/${fileName}`, fileName);
  });
}

/**
 * Load a partial template into Handlebars framework
 *
 * @param templatePath full path to the partial template
 * @param templateFileName file name of the partial template with file extension
 */
function loadPartial(templatePath, templateFileName) {
  const partialFileContent = fs.readFileSync(templatePath, 'utf-8');
  const partialName = templateFileName.split('.')[0];
  Handlebars.registerPartial(partialName, partialFileContent);
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

/**
 * Compiles the main shell template
 *
 * @param shellTemplatePath shell template path
 * @returns {HandlebarsTemplateDelegate<any>} compiled shell template
 */
function shellTemplate(shellTemplatePath) {
  const template = fs.readFileSync(shellTemplatePath, 'utf-8');
  return Handlebars.compile(template);
}

