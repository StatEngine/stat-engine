import request from 'request';
import _ from 'lodash';

import config from '../../config/environment';

export function getMatrix(incident, cb) {
  let pairs = [];
  let distances = {};

  let results = {};

  _.map(incident.apparatus, u => {
    const unit_id = _.get(u, 'unit_id');
    const longitude = _.get(u, 'unit_status.dispatched.longitude');
    const latitude = _.get(u, 'unit_status.dispatched.latitude');
    distances[unit_id] = _.get(u, 'distance');
    if(latitude && longitude) pairs.push({ unit_id, longitude, latitude });

    if (u.distance) {
      results[u.unit_id] = {
        distance: u.distance
      };
    }
  });

  if(pairs.length === 0) {
    return cb(null, results);
  }

  let longitude = _.get(incident, 'address.longitude');
  let latitude = _.get(incident, 'address.latitude');
  if(!longitude || !latitude) return cb(new Error('No incident coordinates'));
  pairs.push({ longitude, latitude });

  const coordinates = _.map(pairs, p => `${p.longitude},${p.latitude}`).join(';');
  const options = {
    uri: `https://api.mapbox.com/directions-matrix/v1/mapbox/driving/${coordinates}`,
    qs: {
      access_token: config.mapbox.token,
      annotations: 'distance,duration'
    },
    json: true,
  };

  let destinationIndex = pairs.length - 1;
  request(options, (err, res, body) => {
    if(err) return cb(err);

    /* Body looks like
    { distances:
      [ [ 0, 2032, 2982.3, 1928.6 ],
        [ 2065.4, 0, 4650.1, 2453.3 ],
        [ 3189.3, 4637.7, 0, 2451.4 ],
        [ 1961.4, 2592.6, 2490.8, 0 ] ],
      durations:
      [ [ 0, 226.3, 376.7, 280.3 ],
        [ 236.6, 0, 499.7, 374.6 ],
        [ 390.7, 518.9, 0, 381.1 ],
        [ 287.4, 307.8, 333.2, 0 ] ],
      destinations:
      [ { name: '', location: [Array] },
        { name: 'Old Brook Circle', location: [Array] },
        { name: '', location: [Array] },
        { name: '', location: [Array] } ],
      sources:
      [ { name: '', location: [Array] },
        { name: 'Old Brook Circle', location: [Array] },
        { name: '', location: [Array] },
        { name: '', location: [Array] } ],
      code: 'Ok' }
    */
    for(let i = 0; i < destinationIndex; i += 1) {
      let unit = pairs[i].unit_id;
      if (!results[unit]) results[unit] = {};

      // use mapbox distance if not set by cad
      if (!results[unit].distance) results[unit].distance = body.distances[i][destinationIndex] * 0.000621371;
      results[unit].duration = body.durations[i][destinationIndex]
    }
    cb(null, results);
  });
}

export default getMatrix;
