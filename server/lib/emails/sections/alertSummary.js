/* eslint-disable no-use-before-define */
import _ from 'lodash';

// import getRuleAnalysis from '../getRuleAnalysis';
import { alertColors } from '../../../api/email/sendNotificationControllerConstants';
import { validateAlertSummaryParams } from '../validateMetricsParams';

export default function alertSummary(params) {
  if (!validateAlertSummaryParams(params)) {
    throw Error('Missing ruleAnalysis or reportOptions');
  }

  const { ruleAnalysis, reportOptions } = params;
  return formatAlerts(ruleAnalysis, reportOptions);
}

/**
 * Add colors to the alerts based on the level of the alerts: DANGER and WARNING.
 * Writes alerts to two objects, one object for regular alerts, one object for condensed alerts.
 * Condensed alerts are rendered using condensed layout.
 *
 * @param alerts alerts to add colors to
 * @param reportOptions report options
 * @returns {{outAlerts: {name: string, content: []}, outAlertsCondensed: {name: string, content: []}}} condensed alerts object and regular alerts object
 * @private
 */
function formatAlerts(alerts, reportOptions) {
  const alertsData = {
    name: 'alerts',
    alerts: [],
    condensedAlerts: [],
  };

  _.forEach(alerts, ruleViolations => {
    ruleViolations.forEach(violation => {
      if (violation.level === 'DANGER') {
        violation.rowColor = alertColors.danger.row;
        violation.rowBorderColor = alertColors.danger.rowBorder;
      } else if (violation.level === 'WARNING') {
        violation.rowColor = alertColors.warning.row;
        violation.rowBorderColor = alertColors.warning.rowBorder;
      }
      const showAlert = _.get(reportOptions, `sections.showAlertSummary[${violation.rule}]`);
      if (showAlert || (_.isUndefined(showAlert) && violation.default_visibility)) {
        if (violation.condenseRendering) {
          alertsData.condensedAlerts.push(violation);
        } else {
          alertsData.alerts.push(violation);
        }
      }
    });
  });
  if (alertsData.condensedAlerts.length === 0 && alertsData.alerts.length === 0) {
    alertsData.alerts.push({
      rowColor: alertColors.warning.row,
      rowBorderColor: alertColors.warning.rowBorder,
      description: 'No alerts found for today',
      details: 'If this is unexpected, please contact support.',
    });
  }
  return alertsData;
}
