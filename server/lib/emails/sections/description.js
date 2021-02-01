import moment from 'moment-timezone';

import { getShift } from '../../shift';
import { TimeUnit } from '../../../components/constants/time-unit';

export default function descriptionSection(fireDepartment, timeRange, comparisonTimeRange, reportOptions) {
  const timeUnit = reportOptions.timeUnit.toLowerCase();
  const timeStart = timeRange.start;
  const timeEnd = timeRange.end;
  const compStart = comparisonTimeRange.start;
  const compEnd = comparisonTimeRange.end;
  const { title, subtitle } = getTitleAndSubtitle(timeRange, timeUnit, fireDepartment);

  return {
    departmentName: fireDepartment.name,
    timeRange: getRangeString(timeStart, timeEnd),
    comparisonTimeRange: getRangeString(compStart, compEnd),
    runTime: moment()
      .tz(fireDepartment.timezone)
      .format('lll'),
    title,
    subtitle,
    shift: getShift(fireDepartment.firecares_id, timeRange.start),
  };
}

function getTitleAndSubtitle(timeRange, timeUnit, fireDepartment) {
  const timeStart = moment.parseZone(timeRange.start);
  let title;
  let subtitle;

  if (timeUnit === TimeUnit.Shift) {
    title = `Shift Report - ${timeStart.format('YYYY-MM-DD')}`;
    subtitle = `Shift ${getShift(fireDepartment.firecares_id, timeStart)}`;
  } else if (timeUnit === TimeUnit.Week) {
    title = `Weekly Report - W${timeStart.week()}`;
  } else if (timeUnit === TimeUnit.Month) {
    title = `Monthly Report - ${timeStart.format('MMMM')}`;
  } else if (timeUnit === TimeUnit.Year) {
    title = `Yearly Report - ${timeStart.year()}`;
  }

  return { title, subtitle };
}

function getRangeString(start, end) {
  return `${moment.parseZone(start).format('lll')} - ${moment.parseZone(end).format('lll')}`;
}
