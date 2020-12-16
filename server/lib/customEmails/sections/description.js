import moment from 'moment-timezone';
import { FirecaresLookup } from '@statengine/shiftly';
import getRuleAnalysis from '../getRuleAnalysis';

function _getShift(firecaresId, date) {
  const ShiftConfiguration = FirecaresLookup[firecaresId];
  if (ShiftConfiguration) {
    const shiftly = new ShiftConfiguration();
    return shiftly.calculateShift(date);
  }
  return '';
}

function _formatDescription(emailData, comparisonTimeRange) {
  const { fireDepartment, timeRange } = emailData;
  const timeStart = moment.parseZone(emailData.timeRange.start);
  const title = `Custom Report - ${timeStart.format('YYYY-MM-DD')}`;
  const subtitle = '';

  return {
    name: 'description',
    content: {
      departmentName: fireDepartment.name,
      timeRange: `${moment.parseZone(timeRange.start).format('lll')} - ${moment.parseZone(timeRange.end).format('lll')}`,
      //   comparisonTimeRange: `${moment.parseZone(comparisonTimeRange.start).format('lll')} - ${moment.parseZone(comparisonTimeRange.end).format('lll')}`,
      runTime: moment()
        .tz(fireDepartment.timezone)
        .format('lll'),
      title,
      subtitle,
      shift: _getShift(fireDepartment.firecares_id, timeRange.start),
    },
  };
}

export default async function description(emailData) {
  const ruleAnalysis = await getRuleAnalysis(emailData);
  return _formatDescription(emailData, ruleAnalysis.previousTimeFilter);
}
