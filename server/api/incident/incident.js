import _ from 'lodash';
import moment from 'moment';

const DATE_FORMAT = 'MMMM Do YYYY [at] hh:mm:ss';

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
    return this.category === 'FIRE'
  }

  hasApparatus() {
    return this.apparatus && this.apparatus.length > 0;
  }

  isEMSIncident() {
    return this.category === 'EMS'
  }

  isOtherIncident() {
    return this.category === 'OTHER'
  }

  get eventOpened() {
    return _.get(this.incident, 'description.event_opened');
  }

  get eventClosed() {
    return _.get(this.incident, 'description.event_closed');
  }

  get eventDuration() {
    return moment.duration(
      moment(_.get(this.incident, 'description.event_closed'))
      .diff(moment(_.get(this.incident, 'description.event_opened'))));
  }

  get departmentName() {
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
    return  _.get(this.incident, 'address.population_density');
  }

  formatDate(date) {
    return moment(date).tz(this.timezone).format(DATE_FORMAT);
  }

  get censusBlock() {
    return  _.get(this.incident, 'address.location.census.census_2010.block');
  }

  get weatherSummary() {
    return  _.get(this.incident, 'weather.currently.summary');
  }

  get firstDueStation() {
    return  _.get(this.incident, 'address.first_due');
  }

  get callAlarmHandlingDurationSeconds() {
    return  _.get(this.incident, 'durations.alarm_handling.seconds');
  }

  get totalResponseDurationMinutes() {
    return  _.get(this.incident, 'durations.total_response.minutes');
  }

  get firstUnitDispatched() {
    return _.find(this.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1);
  }

  get firstUnitArrived() {
    return _.find(this.apparatus, u => _.get(u, 'unit_status.arrived.order') === 1);
  }

  get firstEngineUnitArrived() {
    let arrivedEngines = _.filter(this.apparatus, u => u.unit_type === 'Engine' && _.get(u, 'unit_status.arrived.timestamp'));

    if (arrivedEngines.length === 0) return;
    const sorted = _.sortBy(arrivedEngines, [(e) => moment(e.unit_status.arrived.timestamp)]);
    return sorted[0];
  }

  get firstUnitDue() {
    return _.find(this.apparatus, u => _.get(u, 'first_due'));
  }

  get firstUnitDueArrivalTime() {
    return this.firstUnitDue ? _.get(this.firstUnitDue, 'unit_status.arrived.timestamp') : undefined;
  }

  get firstUnitArrivedArrivalTime() {
    return this.firstUnitArrived ? _.get(this.firstUnitArrived, 'unit_status.arrived.timestamp') : undefined;
  }

  get alarmProcessingTimeSeconds() {
    return _.get(this.incident, 'NFPA.alarm_processing_duration_seconds');
  }

  get firstEngineTravelSeconds() {
    return _.get(this.incident, 'NFPA.first_engine_travel_duration_seconds');
  }

  get travelMatrix() {
    return _.get(this.incident, 'travelMatrix');
  }
}
