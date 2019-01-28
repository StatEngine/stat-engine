
import _ from 'lodash';
import rp from 'request-promise';
import Promise from 'bluebird';
import config from '../../config/environment';

export const getMatrix = async incident => {
  let pairs = [];
  let distances = {};
  let results = {};

  _.map(incident.apparatus, u => {
    const unit_id = _.get(u, 'unit_id');
    const longitude = _.get(u, 'unit_status.dispatched.longitude');
    const latitude = _.get(u, 'unit_status.dispatched.latitude');
    distances[unit_id] = _.get(u, 'distance');
    if(latitude && longitude) pairs.push({ unit_id, longitude, latitude });

    if(u.distance) {
      results[u.unit_id] = {
        distance: u.distance
      };
    }
  });

  if(pairs.length === 0) {
    return results;
  }

  let longitude = _.get(incident, 'address.longitude');
  let latitude = _.get(incident, 'address.latitude');
  if(!longitude || !latitude) {
    return results;
  }

  await Promise.map(_.chunk(pairs, 24), async splitPairs => {
    // Add destination.
    splitPairs.push({ longitude, latitude });

    const coordinates = _.map(splitPairs, p => `${p.longitude},${p.latitude}`).join(';');
    const options = {
      uri: `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}`,
      qs: {
        access_token: config.mapbox.token,
        annotations: 'distance,duration'
      },
      json: true,
    };

    let destinationIndex = splitPairs.length - 1;
    const body = await rp(options);

    if(_.isEmpty(body) || _.isEmpty(body.distances) || _.isEmpty(body.durations)) {
      throw new Error('Unknown format from mapbox');
    }
    for(let i = 0; i < destinationIndex; i += 1) {
      let unit = splitPairs[i].unit_id;
      if(!results[unit]) results[unit] = {};

      // use mapbox distance if not set by cad
      if(!results[unit].distance) results[unit].distance = body.distances[i][destinationIndex] * 0.000621371;
      results[unit].duration = body.durations[i][destinationIndex];
    }
  });

  return results;
};

export default getMatrix;
