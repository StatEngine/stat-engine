import moment from 'moment-timezone';

import getRuleAnalysis from '../getRuleAnalysis';
import { getShift, getShiftTimeFrame } from '../../shift';

export default async function description(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  return formatDescription(emailData, ruleAnalysis.previousTimeFilter);
}

function formatDescription(emailData, comparisonTimeRange) {
  const { fireDepartment, timeRange } = emailData;
  const timeStart = moment.parseZone(emailData.timeRange.start);
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
