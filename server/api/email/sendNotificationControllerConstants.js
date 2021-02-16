export const alertColors = {
  success: {
    row: '#dff0d8',
    rowBorder: '#83d062',
  },
  warning: {
    row: '#fcf8e3',
    rowBorder: '#c7ba75',
  },
  danger: {
    row: '#f2dede',
    rowBorder: '#bb7474',
  },
};

export const battalionMetricConfigs = [
  ['incidentCount'],
];

export const incidentTypeMetricConfigs = [
  ['incidentCount'],
];

export const jurisdictionMetricConfigs = [
  ['incidentCount'],
];

export const unitMetricConfigs = [
  ['incidentCount'],
  ['transportsCount', 'showTransports'],
  ['distanceToIncidentSum', 'showDistances'],
  ['eventDurationSum'],
  ['turnoutDurationPercentile90'],
  ['fireTurnoutDurationPercentile90'],
  ['emsTurnoutDurationPercentile90'],
  ['responseDurationPercentile90'],
];
