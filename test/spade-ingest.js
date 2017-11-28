const request = require('request');
const async = require('async');

const endpoint = 'http://localhost:3000/api/';
const apiKey = '1234';

let fireDepartmentId;

// However its defined in SPADE
const incident = {

};

async.series([
  // Get Fire Department info from Statengine
  (cb) => {
    const options = {
      uri: `${endpoint}/users/me`,
      method: 'GET',
      qs: {
        apikey: apiKey
      },
      json: true
    };
    /* Reutrns:
    {
        "user": {
            "profile": {
                "name": "RichmondUser",
                "role": "kibana_ro"
            },
            "username": "richmond",
            "first_name": "Richmond",
            "last_name": "User",
            "email": "richmond@prominentedge.com",
            "role": "kibana_ro",
            "provider": "local",
            "api_key": "1234",
            "fire_department__id": 1533
        },
        "fire_department": {
            "es_indices": {
                "fire-incident": "93345-va-richmond_fire_and_emergency_services-fire-incident*",
                "vehicle-telemetry": "93345-va-richmond_fire_and_emergency_services-vehicle-telemetry*"
            },
            "fd_id": "76000",
            "name": "Richmond Fire and Emergency Services",
            "state": "VA",
            "firecares_id": "93345",
            "timezone": "US/Eastern"
        }
    }
    */
    request.get(options, (err, response, body) => {
      if (err) return cb(err);
      if (response.statusCode !== 200) return cb(new Error(`Unexpected response: ${response.statusCode}`));
      if (!body) return cb(new Error('Unexpected response: empty body'));

      // else save off firecares id if you dont have
      fireDepartmentId = body.fire_department.firecares_id;
      cb();
    });
  },
  // Encode message via Proto buf
  (cb) => {
    cb();
  },
  // Post to StatEngine
  (cb) => {
    const options = {
      uri: `${endpoint}/fire-departments/${fireDepartmentId}/fire-incidents/${incident.id}`,
      method: 'PUT',
      qs: {
        apikey: apiKey
      }
    };
    cb();
  }
], (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info('Ingest call completed successful');
  }
});
