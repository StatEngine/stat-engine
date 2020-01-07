
import _ from 'lodash';
import moment from 'moment-timezone';

function minTimestamp(timestamps, candidateFields) {
  const candidates = [];
  _.forEach(candidateFields, field => {
    if(timestamps[field]) candidates.push(timestamps[field]);
  });

  let min;
  if(candidates.length > 0) min = _.minBy(candidates, t => moment(t).valueOf());

  return min;
}

export function getApparatusTimeData(appData) {
  const timestamps = {};
  _.forOwn(appData.unit_status, (data, key) => {
    if(data.timestamp) timestamps[key] = data.timestamp;
  });

  // determine when unit left scene
  if((timestamps.dispatched || timestamps.enroute) && !timestamps.arrived) {
    timestamps.cancel_started = timestamps.enroute ? timestamps.enroute : timestamps.dispatched;
  }

  timestamps.leftScene = minTimestamp(timestamps, ['transport_started', 'available', 'in_quarters', 'available_radio', 'available_mobile', 'cleared']);
  timestamps.earliestCleared = minTimestamp(timestamps, ['available', 'in_quarters', 'available_radio', 'available_mobile', 'cleared']);
  timestamps.earliestAvailable = minTimestamp(timestamps, ['available', 'in_quarters', 'available_radio', 'available_mobile']);

  const durationConfigs = [
    ['turnout', 'Turnout', 'dispatched', 'enroute'],
    ['travel', 'Travel', 'enroute', 'arrived'],
    ['cancelled', 'Out-of-service', 'cancel_started', 'earliestCleared'],
    ['intervention', 'Intervention', 'arrived', 'leftScene'],
    ['transport', 'Transport', 'transport_started', 'transport_arrived'],
    ['post-transport', 'Post Transport', 'transport_arrived', 'earliestCleared'],
    ['earliestCleared', 'Unavailable', 'earliestAvailable', 'unavailable']
  ];

  const durations = [];
  _.forEach(durationConfigs, config => {
    const [name, displayName, start, end] = config;
    const tStart = timestamps[start];
    const tEnd = timestamps[end];
    if(tStart && tEnd) {
      const diff = moment(tEnd).diff(moment(tStart));
      durations.push({
        name,
        displayName,
        start: tStart,
        end: tEnd,
        duration: moment.duration(diff) });
    }
  });

  return {
    timestamps,
    durations,
  };
}

export default getApparatusTimeData;
