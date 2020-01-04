import percentile from 'percentile';

export function getUnitBusynessLabel(unitSumEventDuration, quintiles) {
  if(unitSumEventDuration < quintiles['20']) {
    return 'slow';
  } else if(unitSumEventDuration > quintiles['80']) {
    return 'busy';
  } else {
    return 'typical';
  }
}

export function getUnitBusynessQuintiles(unitSumEventDurationList) {
  return {
    '0': percentile(0, unitSumEventDurationList),
    '20': percentile(20, unitSumEventDurationList),
    '40': percentile(40, unitSumEventDurationList),
    '60': percentile(60, unitSumEventDurationList),
    '80': percentile(80, unitSumEventDurationList),
    '100': percentile(100, unitSumEventDurationList),
  };
}
