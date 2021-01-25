import moment from 'moment-timezone';

import getRuleAnalysis from '../getRuleAnalysis';
import { getShift } from '../../shift';
import { TimeUnit } from '../../../components/constants/time-unit';

export async function descriptionPrev(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  return formatDescription(emailData, ruleAnalysis.previousTimeFilter);
}

function formatDescription(emailData, comparisonTimeRange) {
  const { fireDepartment, timeRange } = emailData;
  const timeStart = moment.parseZone(timeRange.start);
  const title = `Custom Report - ${timeStart.format('YYYY-MM-DD')}`;
  const subtitle = '';
  const timeRangeStr = getRangeString(timeRange.start, timeRange.end);
  const comparisonTimeRangeStr = getRangeString(comparisonTimeRange.start, comparisonTimeRange.end);
  const firecaresId = fireDepartment.firecares_id;

  return {
    departmentName: fireDepartment.name,
    timeRange: timeRangeStr,
    comparisonTimeRange: comparisonTimeRangeStr,
    runTime: moment()
      .tz(fireDepartment.timezone)
      .format('lll'),
    title,
    subtitle,
    shift: getShift(firecaresId, timeRange.start),
  };
}

function getRangeString(start, end) {
  return `${moment.parseZone(start).format('lll')} - ${moment.parseZone(end).format('lll')}`;
}

export async function description(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  let title;
  let subtitle;
  const timeUnit = reportOptions.timeUnit.toLowerCase();

  const timeStart = moment.parseZone(timeRange.start);
  if (timeUnit === TimeUnit.Shift) {
    title = `Shift Report - ${timeStart.format('YYYY-MM-DD')}`;
    subtitle = `Shift ${getShift(fireDepartment.firecares_id, timeRange.start)}`;
  } else if (timeUnit === TimeUnit.Week) { title = `Weekly Report - W${timeStart.week()}`; } else if (timeUnit === TimeUnit.Month) { title = `Monthly Report - ${timeStart.format('MMMM')}`; } else if (timeUnit === TimeUnit.Year) { title = `Yearly Report - ${timeStart.year()}`; }

  return {
    departmentName: fireDepartment.name,
    timeRange: `${moment.parseZone(timeRange.start).format('lll')} - ${moment.parseZone(timeRange.end).format('lll')}`,
    comparisonTimeRange: `${moment.parseZone(comparisonTimeRange.start).format('lll')} - ${moment.parseZone(comparisonTimeRange.end).format('lll')}`,
    runTime: moment()
      .tz(fireDepartment.timezone)
      .format('lll'),
    title,
    subtitle,
    shift: getShift(fireDepartment.firecares_id, timeRange.start),
  };
}
