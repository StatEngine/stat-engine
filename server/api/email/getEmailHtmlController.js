import handlebars from 'handlebars';
import helpers from 'handlebars-helpers';

import config from '../../config/environment';
import HtmlReports from './htmlReports';
import HandlebarsEmailTemplate from './templates/handlebarsEmailTemplate';

/**
 * This initializes the handlebars-helpers imported on line 2. handlebars-helpers gives us access
 * to a wider palette of operators to use in templates. for example, in agencyIncidentTypeSummary.hbs
 * you can see that we use the #compare operator on line 61
 */
helpers({ handlebars });

export default function getEmailHtml(mergeVars) {
  const htmlReports = new HtmlReports(new HandlebarsEmailTemplate(
    handlebars,
    config.mailSettings.emailShellCustomTemplatePath,
    config.mailSettings.emailPartialsTemplatePath,
  ).template());
  return htmlReports.report(mergeVars);
}
