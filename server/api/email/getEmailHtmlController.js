import handlebars from 'handlebars';
import helpers from 'handlebars-helpers';

import config from '../../config/environment';
import HtmlReports from './htmlReports';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';

helpers({ handlebars });
// const comp = helpers.comparison({ handlebars });

export async function getEmailHtmlController(req, res) {
  const { mergeVars } = req.body;
  return getEmailHtml(mergeVars);
}

export function getEmailHtml(mergeVars) {
  const htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
    handlebars,
    config.mailSettings.emailShellTemplatePath,
    config.mailSettings.emailPartialsTemplatePath,
  ).template());
  return htmlReports.report(mergeVars);
}

export function getCustomEmailHtml(mergeVars) {
  const htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
    handlebars,
    config.mailSettings.emailShellCustomTemplatePath,
    config.mailSettings.emailPartialsTemplatePath,
  ).template());
  return htmlReports.report(mergeVars, false);
}
