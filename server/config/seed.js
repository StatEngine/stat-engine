/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import uuidv4 from 'uuid/v4';

import sqldb from '../sqldb';

const User = sqldb.User;
const FireDepartment = sqldb.FireDepartment;
const Tweet = sqldb.Tweet;
const Extension = sqldb.Extension;
const ExtensionConfiguration = sqldb.ExtensionConfiguration;

let twitterEnrichment;

Extension
  .sync()
  .then(() => Extension.destroy({ where: {} }))
  .then(() => Extension.create({
    name: 'Twitter',
    description: 'Auto-generate recommended tweets capturing important metrics of your department',
    features: [
      'Directly post to your departments Twitter',
      'Ability to edit and preview before posting',
      'Include rich media',
    ],
    type: 'PERIODIC',
    categories: 'Social Media,Reporting',
    featured: true,
    config_options: [{
      name: 'consumer_key',
      description: 'Consumer Key',
      type: 'password',
      required: true,
    }, {
      name: 'consumer_secret',
      description: 'Consumer Secret',
      type: 'password',
      required: true,
    }, {
      name: 'access_token_key',
      description: 'Access Token Key',
      type: 'password',
      required: true,
    }, {
      name: 'access_token_secret',
      description: 'Access Token Secret',
      type: 'password',
      required: true,
    }]
  }))
  .then((extension) => twitterEnrichment = extension)
  .then(() => Extension.create({
    name: 'Census Data',
    description: 'Enrich data with population density from 2010 Census Data',
    type: 'ENRICHMENT',
    categories: 'Enrichment',
    featured: true,
  }))
  .then(() => Extension.create({
    name: 'Weather',
    description: 'Enrich data with weather data from DarkSky',
    type: 'ENRICHMENT',
    categories: 'Enrichment',
    featured: false,
  }))
  .then(User.sync())
  .then(() => User.destroy({ where: {} }))
  .then(() => Tweet.destroy({ where: {} }))
  .then(() => ExtensionConfiguration.destroy({ where: {} }))
  .then(() => FireDepartment.sync())
  .then(() => FireDepartment.destroy({ where: {} }))
  .then(() => FireDepartment.create({
    fd_id: '76000',
    firecares_id: '93345',
    name: 'Richmond Fire and Emergency Services',
    state: 'VA',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user,kibana_admin',
      username: 'richmond',
      first_name: 'Richmond',
      last_name: 'User',
      email: 'richmond@prominentedge.com',
      password: 'password',
      nfors: true,
      api_key: '1234',
      aws_access_key_id: 'awsKey',
      aws_secret_access_key: 'awsSecret',
    }],
    Tweets: [{
      tweet_json: {
        status: '#richmond responded to 475 calls on Saturday, January 13th. There were 177 critical and 187 non-critical EMS dispatches, and 111 Fire related incidents and other types of emergencies',
      }
    }],
  }, {
    include: [ FireDepartment.Users, FireDepartment.Tweets ]
  }))
  .then(richmond => ExtensionConfiguration.create({
    enabled: true,
    fire_department__id: richmond._id,
    extension__id: twitterEnrichment._id,
    config_json: {
      options: {
        consumer_key: 'cvdJKaUTfGrcspoIlX8dxakRw',
        consumer_secret: 'ICoyiZHguN4nRpKaY1H3FsZ800LCpxYFVKO6mI1FuXx2FXeQG1',
        access_token_key: '941371673726484480-mKsT1fBibKS8j4E3GDGm2FTNzWhw9rH',
        access_token_secret: 'y5Kq54mYETzd8qj8Oo9mu2DtfNEPpC9mhvplD4KqK7g9c',
      },
      tasks: [{
        "name": "richmondTwitter",
        "schedule": {
          "later": "every 5 seconds"
        },
        "preprocessors": [{
          "type": "daily",
          "options": {
            "timezone": "US/Eastern"
          }
        }],
      	"queryTemplates": [{
          "type": "count",
          "request": {
            "index": "93345-va-richmond_fire_and_emergency_services-fire-incident*",
            "body": {
              "query": {
                "bool": {
                  "must": [{
                    "term": {
                      "description.suppressed": false
                    }
                  }],
                  "filter" : {
                    "range": {
                      "description.event_opened": {
                        "gte" : "{{daily.timeFrame.start}}",
                        "lt" : "{{daily.timeFrame.end}}"
                      }
                    }
                  }
                }
              }
            }
          }
        }, {
          "type": "count",
          "request": {
            "index": "93345-va-richmond_fire_and_emergency_services-fire-incident*",
            "body": {
              "query": {
                "bool": {
                  "must": [{
                    "term": {
                      "description.type":  "EMS-1STRESP"
                    }
                  }, {
                    "term": {
                      "description.suppressed": false
                    }
                  }],
                  "filter" : {
                    "range": {
                      "description.event_opened": {
                        "gte" : "{{daily.timeFrame.start}}",
                        "lt" : "{{daily.timeFrame.end}}"
                      }
                    }
                  }
                }
              }
            }
          }
        }, {
          "type": "count",
          "request": {
            "index": "93345-va-richmond_fire_and_emergency_services-fire-incident*",
            "body": {
              "query": {
                "bool": {
                  "must_not": {
                    "term": {
                      "description.type":  "EMS-1STRESP"
                    }
                  },
                  "must": {
                    "term": {
                      "description.suppressed": false
                    }
                  },
                  "filter" : {
                    "range": {
                      "description.event_opened": {
                        "gte" : "{{daily.timeFrame.start}}",
                        "lt" : "{{daily.timeFrame.end}}"
                      }
                    }
                  }
                }
              }
            }
          }
      	}],
      	"transforms": [{
          "type": "set",
          "path": "totalIncidentCount",
          "value": "queryResults[0].count"
        }, {
          "type": "set",
          "path": "emsIncidentCount",
          "value": "queryResults[1].count"
        }, {
          "type": "set",
          "path": "fireIncidentCount",
          "value": "queryResults[2].count"
        }],
        "actions": [{
          "type": "console",
          "options": {}
        }, {
          "type": "twitter",
          "options": {
            "template": "Richmond responded to <%= totalIncidentCount %> incidents yesterday",
          }
        }]
      }],
    }
  }))
  .then(() => FireDepartment.create({
    fd_id: '08500',
    firecares_id: '83555',
    name: 'Hanover Fire-EMS',
    state: 'VA',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user',
      username: 'hanover',
      first_name: 'Hanover',
      last_name: 'User',
      email: 'hanover@prominentedge.com',
      password: 'password',
      api_key: uuidv4(),
    }],
    Tweets: [{
      tweet_json: {
        status: 'Hanover tweeet',
      }
    }]
  }, {
    include: [ FireDepartment.Users, FireDepartment.Tweets  ]
  }))
  .then(() => FireDepartment.create({
    fd_id: '11001',
    firecares_id: '98606',
    name: 'Washington DC Fire & EMS Department',
    state: 'DC',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user,ingest',
      username: 'dc',
      first_name: 'DC',
      last_name: 'User',
      email: 'dc@prominentedge.com',
      password: 'password',
      api_key: 'washingtondc',
    }]
  }, {
    include: [ FireDepartment.Users, FireDepartment.Tweets ]
  }))
  .then(() => FireDepartment.create({
    fd_id: '11223',
    firecares_id: '97477',
    name: 'Tucson Fire Department',
    state: 'AZ',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user',
      username: 'tucson',
      first_name: 'tucson',
      last_name: 'User',
      email: 'tucons@prominentedge.com',
      password: 'password',
      api_key: 'tucson',
    }]
  }, {
    include: [ FireDepartment.Users, FireDepartment.Tweets ]
  }))
  .then(() => FireDepartment.create({
    fd_id: '25035',
    firecares_id: '75500',
    name: 'Boston Fire Department',
    state: 'MA',
    timezone: 'US/Eastern',
    Users: [{
      provider: 'local',
      role: 'user,ingest',
      username: 'boston',
      first_name: 'boston',
      last_name: 'User',
      email: 'boston@prominentedge.com',
      password: 'password',
      api_key: 'boston',
    }]
  }, {
    include: [ FireDepartment.Users, FireDepartment.Tweets ]
  }))
  .then(() => User.create({
    provider: 'local',
    role: 'admin',
    username: 'admin',
    email: 'admin@prominentedge.com',
    password: 'password',
    nfors: true,
    api_key: 'admin',
    aws_access_key_id: 'awsKey',
    aws_secret_access_key: 'awsSecret',
  }))
  .then(() => console.log('finished populating data'));
