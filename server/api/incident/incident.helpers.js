import _ from 'lodash';
import moment from 'moment-timezone';

// TODO revisit all of this ---- maybe use nlp or something else to more intelligently construct sentences and grammer

const compileIncidentSummary = _.template('\<%= departmentName %> responded to <%= incidentArticle %> <%= incidentType %> incident on <%= incidentDate %> at <%= incidentTime %>.\
  The response included <%= numOfUnits %> units from <%= numOfStations %> different stations.\
  The incident was resolved in <%= incidentDuration %> minutes.');

export function generateIncidentSummary(incident) {
  const category = _.get(incident, 'description.category');
  const eventOpened = _.get(incident, 'description.event_opened');
  const timezone = _.get(incident, 'fire_department.timezone');
  const duration = moment.duration(
    moment(_.get(incident, 'description.event_opened'))
    .diff(moment(_.get(incident, 'description.event_closed'))));

  const stations = _.uniq(_.map(_.get(incident, 'apparatus'), 'station'));
  return compileIncidentSummary({
    departmentName: _.get(incident, 'fire_department.name'),
    incidentArticle: category === 'EMS' ? 'an': 'a',
    incidentType: !category || category === 'OTHER' ? 'unknown' : _.lowerCase(category),
    incidentDate: moment(eventOpened).tz(timezone).format("dddd, MMMM Do YYYY"),
    incidentTime: moment(eventOpened).tz(timezone).format("h:mm:ss a"),
    numOfUnits: _.get(incident, 'apparatus.length'),
    numOfStations: stations.length,
    incidentDuration: duration.as('minutes').toFixed(1),
  });
}

export function generateLocationSummary(incident) {
  const populationDensity = _.get(incident, 'address.population_density');
  const parcelData = _.get(incident, 'address.parcel');
  const censusData = _.get(incident, 'address.census');

  let location = 'This address is located in';
  if (populationDensity) location += 'an ' + populationDensity + ' zoned area'

  return location;
}

export function generateUnitSummary(incident) {
  return 'The response included ' + _.get(incident, 'apparatus.length') + ' units, including ....'
}
