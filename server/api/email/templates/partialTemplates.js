import fs from 'fs';
import { Log } from '../../../util/log';


/**
 * The partial templates.
 * The purpose of partials is to be loaded and joined with the main top level shell template.
 */
export default class PartialTemplates {
  /**
   * Constructs the partial templates
   * @param handlebars Handlebars library object
   * @param partialTemplatesPath partial templates path
   */
  constructor(handlebars, partialTemplatesPath) {
    this.handlebars = handlebars;
    this.partialTemplatesPath = partialTemplatesPath;
  }

  /**
   * Load all partial templates into Handlebars object
   *
   * Side effect: modifies handlebar object
   */
  load() {
    loadPartials(this.handlebars, this.partialTemplatesPath);
  }
}

/**
 * Load all partial templates into Handlebars object
 *
 * Side effect: modifies handlebar object
 *
 * @param handlebars handlebars library object
 * @param partialTemplatesPath location of partial templates
 */
function loadPartials(handlebars, partialTemplatesPath) {
  Log.debug('Loading partial templates from', partialTemplatesPath);
  const files = fs.readdirSync(partialTemplatesPath);
  files.forEach(fileName => {
    loadPartial(handlebars, `${partialTemplatesPath}/${fileName}`, fileName);
  });
}

/**
 * Load a single partial template into Handlebars framework
 *
 * Side effect: modifies handlebar object
 *
 * @param handlebars Handlebars library object
 * @param templatePath full path to the partial template
 * @param templateFileName file name of the partial template with file extension
 */
function loadPartial(handlebars, templatePath, templateFileName) {
  const partialFileContent = fs.readFileSync(templatePath, 'utf-8');
  const partialName = templateFileName.split('.')[0];
  handlebars.registerPartial(partialName, partialFileContent);
}
