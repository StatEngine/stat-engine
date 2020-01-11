import _ from 'lodash';
import moment from 'moment-timezone';

import humanizeDuration from 'humanize-duration';

const DATE_FORMAT = 'HH:mm  on MMMM Do YYYY';

export class Incident {
  constructor(incident) {
    this.incident = incident;
  }

  get category() {
    return _.get(this.incident, 'description.category');
  }

  get apparatus() {
    return _.get(this.incident, 'apparatus');
  }

  isFireIncident() {
    return this.category === 'FIRE';
  }

  hasApparatus() {
    return this.apparatus && this.apparatus.length > 0;
  }

  isEMSIncident() {
    return this.category === 'EMS';
  }

  isOtherIncident() {
    return this.category === 'OTHER';
  }

  get address() {
    return _.get(this.incident, 'address');
  }

  get fire_department() {
    return _.get(this.incident, 'fire_department');
  }

  get description() {
    return _.get(this.incident, 'description');
  }

  get durations() {
    return _.get(this.incident, 'durations');
  }

  get weather() {
    return _.get(this.incident, 'weather');
  }

  get eventOpened() {
    return _.get(this.incident, 'description.event_opened');
  }

  get eventClosed() {
    return _.get(this.incident, 'description.event_closed');
  }

  get fireDepartmentName() {
    return _.get(this.incident, 'fire_department.name');
  }

  get timezone() {
    return _.get(this.incident, 'fire_department.timezone');
  }

  get stations() {
    return _.uniq(_.map(_.get(this.incident, 'apparatus'), 'station'));
  }

  get units() {
    return _.get(this.incident, 'apparatus');
  }

  get populationDensity() {
    return _.get(this.incident, 'address.population_density');
  }

  formatDate(date) {
    return moment(date)
      .tz(this.timezone)
      .format(DATE_FORMAT);
  }

  get censusBlock() {
    return _.get(this.incident, 'address.location.census.census_2010.block');
  }

  get weatherSummary() {
    return _.get(this.incident, 'weather.currently.summary');
  }

  get firstDueStation() {
    return _.get(this.incident, 'address.first_due');
  }

  get callAlarmHandlingDurationHumanized() {
    let seconds = _.get(this.incident, 'durations.alarm_handling.seconds');
    return seconds ? humanizeDuration(seconds * 1000) : undefined;
  }

  get callAlarmProcessingDurationHumanized() {
    let seconds = _.get(this.incident, 'durations.alarm_processing.seconds');
    return seconds ? humanizeDuration(seconds * 1000) : undefined;
  }

  get responseDurationHumanized() {
    let seconds = _.get(this.incident, 'durations.response.seconds');
    return seconds ? humanizeDuration(seconds * 1000) : undefined;
  }

  get totalResponseDurationHumanized() {
    let seconds = _.get(this.incident, 'durations.total_response.seconds');
    return seconds ? humanizeDuration(seconds * 1000) : undefined;
  }

  get totalEventDurationHumanized() {
    let seconds = _.get(this.incident, 'durations.total_event.seconds');
    return seconds ? humanizeDuration(seconds * 1000) : undefined;
  }

  get firstUnitDispatched() {
    return _.find(this.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1);
  }

  get firstUnitArrived() {
    return _.find(this.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);
  }

  get firstEngineUnitArrived() {
    // Also include ladders and quints because they provide engine capabilites
    let arrivedEngines = _.filter(this.apparatus, u =>
      (u.unit_type === 'Engine' || u.unit_type === 'Ladder' || u.unit_type === 'Quint')
      && _.get(u, 'unit_status.arrived.timestamp'));

    if(arrivedEngines.length === 0) return;
    const sorted = _.sortBy(arrivedEngines, [e => moment(e.unit_status.arrived.timestamp).valueOf()]);
    return sorted[0];
  }

  get firstUnitDue() {
    return _.find(this.apparatus, u => _.get(u, 'first_due'));
  }

  get incidentType() {
    // AgencyIncidentCallTypeDescription are for PulsePoint agencies.
    return this.description.extended_data.AgencyIncidentCallTypeDescription || this.description.type;
  }

  get firstUnitDueArrivalTime() {
    return this.firstUnitDue ? _.get(this.firstUnitDue, 'unit_status.arrived.timestamp') : undefined;
  }

  get firstUnitArrivedArrivalTime() {
    return this.firstUnitArrived ? _.get(this.firstUnitArrived, 'unit_status.arrived.timestamp') : undefined;
  }

  get alarmProcessingDurationSeconds() {
    return _.get(this.incident, 'durations.alarm_processing.seconds');
  }

  get alarmAnsweringDurationSeconds() {
    return _.get(this.incident, 'durations.alarm_answer.seconds');
  }

  get firstEngineTravelSeconds() {
    return this.firstEngineUnitArrived ? _.get(this.firstEngineUnitArrived, 'extended_data.travel_duration') : undefined;
  }

  get travelMatrix() {
    return _.get(this.incident, 'travelMatrix');
  }

  get distanceFromFireDepartment() {
    return _.get(this.incident, 'address.distance_from_fire_department');
  }
}

export default Incident;
