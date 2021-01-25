/* eslint-disable no-use-before-define */
import _ from 'lodash';

// import getRuleAnalysis from '../getRuleAnalysis';
import { alertColors } from '../../../api/email/sendNotificationControllerConstants';

export async function alertSummary(params) {
  // const analysis = await getRuleAnalysis(emailData);
  // const ruleAnalysis = analysis.ruleAnalysis();
  // return formatAlerts(ruleAnalysis);
  const { ruleAnalysis, reportOptions } = params;
  return formatAlerts(ruleAnalysis, reportOptions);
}

// export function formatAlerts(ruleAnalysis) {
//   const mergeVar = {
//     name: 'alerts',
//     content: [],
//   };

//   _.forEach(ruleAnalysis, ruleViolations => {
//     ruleViolations.forEach(violation => {
//       if (violation.level === 'DANGER') {
//         violation.rowColor = alertColors.danger.row;
//         violation.rowBorderColor = alertColors.danger.rowBorder;
//       } else if (violation.level === 'WARNING') {
//         violation.rowColor = alertColors.warning.row;
//         violation.rowBorderColor = alertColors.warning.rowBorder;
//       }
//       mergeVar.content.push(violation);
//     });
//   });

//   // if no alerts
//   if (mergeVar.content.length === 0) {
//     mergeVar.content.push({
//       rowColor: alertColors.success.row,
//       rowBorderColor: alertColors.success.rowBorder,
//       description: 'No alerts',
//       details: 'Keep up the good work!',
//     });
//   }

//   // Add a space after any comma without one after it.
//   mergeVar.content.forEach(alert => {
//     // for condensed alerts, details are in an array
//     if (alert.condenseRendering) {
//       alert.detailList.forEach(detail => {
//         detail.detail = addSpaceAfterComma(detail.detail);
//       });
//     } else {
//       // non-condensed alerts' details are just a string
//       alert.details = addSpaceAfterComma(alert.details);
//     }
//   });

//   return mergeVar;
// }

// function addSpaceAfterComma(theString) {
//   return theString.replace(/(,(?=\S))/g, ', ');
// }

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
export function formatAlerts(alerts, reportOptions) {
  // const outAlerts = {
  //   // the name matches a name in rules.js
  //   alerts: [],
  // };
  // const outAlertsCondensed = {
  //   // the name matches a name in rules.js
  //   condensedAlerts: [],
  // };

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
