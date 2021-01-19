/* eslint-disable no-use-before-define */
import _ from 'lodash';

import getRuleAnalysis from '../getRuleAnalysis';
import { alertColors } from '../../../api/email/sendNotificationControllerConstants';

export default async function alertSummary(emailData) {
  const analysis = await getRuleAnalysis(emailData);
  const ruleAnalysis = analysis.ruleAnalysis();
  return formatAlerts(ruleAnalysis);
}

export function formatAlerts(ruleAnalysis) {
  const mergeVar = {
    name: 'alerts',
    alerts: [],
  };
  // console.log('FORMAT ALERTS');
  // console.dir(ruleAnalysis, { depth: null });

  _.forEach(ruleAnalysis, ruleViolations => {
    ruleViolations.forEach(violation => {
      if (violation.level === 'DANGER') {
        violation.rowColor = alertColors.danger.row;
        violation.rowBorderColor = alertColors.danger.rowBorder;
      } else if (violation.level === 'WARNING') {
        violation.rowColor = alertColors.warning.row;
        violation.rowBorderColor = alertColors.warning.rowBorder;
      }
      mergeVar.alerts.push(violation);
    });
  });

  // if no alerts
  if (mergeVar.alerts.length === 0) {
    mergeVar.alerts.push({
      rowColor: alertColors.success.row,
      rowBorderColor: alertColors.success.rowBorder,
      description: 'No alerts',
      details: 'Keep up the good work!',
    });
  }

  // Add a space after any comma without one after it.
  mergeVar.alerts.forEach(alert => {
    alert.details = alert.details.replace(/(,(?=\S))/g, ', ');
  });

  return mergeVar;
}
