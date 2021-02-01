import { isEmpty } from "lodash";

export function validateAggregateMetricsParams(params) {
  const { comparison, reportOptions } = params;

  if (!comparison || isEmptyObj(comparison) || !reportOptions || isEmptyObj(reportOptions)) {
    return false;
  }
  return true;
}

export function validateAlertSummaryParams(params) {
  const { ruleAnalysis, reportOptions } = params;

  if (!ruleAnalysis || isEmptyObj(ruleAnalysis) || !reportOptions || isEmptyObj(reportOptions)) {
    return false;
  }
  return true;
}
function isEmptyObj(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

export function validateDescriptionParams(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  console.log('****************VALIDATE DESCRIPTION');
  if (!fireDepartment || isEmptyObj(fireDepartment) ||
  !timeRange || isEmptyObj(timeRange) ||
  !comparisonTimeRange || isEmptyObj(comparisonTimeRange) ||
  !reportOptions || isEmptyObj(reportOptions)) {
    return false;
  }
  return true;
}
