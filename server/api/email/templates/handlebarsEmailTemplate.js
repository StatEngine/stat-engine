import fs from 'fs';
import Handlebars from 'handlebars';
import { Log } from '../../../util/log';
import PartialTemplates from './partialTemplates';

/**
 * The email template.
 * The template uses Handlebars library
 */
export default class HandlebarsEmailTemplate {
  /**
   * Constructs the email template
   * @param shellTemplatePath path to shell template
   * @param partialTemplatesPath path to partial templates
   */
  constructor(shellTemplatePath, partialTemplatesPath) {
    this.handlebars = Handlebars;
    this.shellTemplatePath = shellTemplatePath;
    this.partialTemplates = new PartialTemplates(this.handlebars, partialTemplatesPath);
  }

  /**
   * Constructs the email template
   * @returns {HandlebarsTemplateDelegate<any>} email template
   */
  template() {
    this.partialTemplates.load();
    Log.debug('Loading shell template from', this.shellTemplatePath);
    const template = fs.readFileSync(this.shellTemplatePath, 'utf-8');
    return this.handlebars.compile(template);
  }
}

