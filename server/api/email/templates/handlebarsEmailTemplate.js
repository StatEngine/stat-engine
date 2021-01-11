import fs from 'fs';
import { Log } from '../../../util/log';
import PartialTemplates from './partialTemplates';

/**
 * The email template.
 * The template uses Handlebars library
 */
export default class HandlebarsEmailTemplate {
  /**
   * Constructs the email template
   * @param handlebars handlebars library object
   * @param shellTemplatePath path to shell template
   * @param partialTemplatesPath path to partial templates
   */
  constructor(handlebars, shellTemplatePath, partialTemplatesPath) {
    this.handlebars = handlebars;
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
    return this.handlebars.compile(fs.readFileSync(this.shellTemplatePath, 'utf-8'));
  }
}

