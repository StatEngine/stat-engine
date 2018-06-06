/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

import uuidv4 from 'uuid/v4';
import { seedKibanaAll, seedIndexTemplates } from '@statengine/se-fixtures';

import sqldb from '../sqldb';

const User = sqldb.User;
const FireDepartment = sqldb.FireDepartment;
const Extension = sqldb.Extension;
const ExtensionConfiguration = sqldb.ExtensionConfiguration;
const ExtensionRequest = sqldb.ExtensionRequest;

let richmond;
let emailReportEnrichment;

if(process.env.NODE_ENV === 'development') {
  Extension
    .sync()
    .then(() => ExtensionConfiguration.sync())
    .then(() => ExtensionConfiguration.destroy({ where: {} }))
    .then(() => ExtensionRequest.sync())
    .then(() => ExtensionRequest.destroy({ where: {} }))
    .then(() => Extension.destroy({ where: {} }))
    .then(() => Extension.create({
      name: 'Twitter',
      short_description: 'Auto-generate recommended tweets capturing important metrics of your department',
      description: 'Auto-generate recommended tweets capturing important metrics of your department',
      features: [
        'Directly post to your departments Twitter',
        'Ability to edit and preview before posting',
        'Include rich media',
      ],
      type: 'PERIODIC',
      categories: 'Social Media,Reporting',
      featured: true,
      image: 'extension-twitter.svg',
      preview: 'extension-twitter-preview.png',
      config_options: [{
        name: 'media_text',
        tooltip: 'Text is overlayed on tweet media',
        description: 'Image Overlay Text',
        type: 'text',
        required: true,
      }]
    }))
    .then(() => Extension.create({
      name: 'Daily Report',
      short_description: 'Daily reports delivered straight to your inbox',
      description: 'Get summary reports delivered straight to your inbox',
      features: [
        'Configurable on shiftly, daily, weekly, or monthly basis',
        'Completely customizable report',
        'Ability to deliver to multiple email accounts',
      ],
      type: 'PERIODIC',
      categories: 'Reporting',
      featured: true,
      image: 'extension-reports.svg',
      config_options: []
    }))
    .then(extension => {
      emailReportEnrichment = extension;
    })
    .then(User.sync())
    .then(() => User.destroy({ where: {} }))
    .then(() => ExtensionConfiguration.destroy({ where: {} }))
    .then(() => FireDepartment.sync())
    .then(() => FireDepartment.destroy({ where: {} }))
    .then(() => FireDepartment.create({
      fd_id: '76000',
      firecares_id: '93345',
      name: 'Richmond Fire and Emergency Services',
      state: 'VA',
      timezone: 'US/Eastern',
      integration_complete: true,
      integration_verified: true,
      latitude: 37.5407,
      longitude: -77.4360,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin,deparment_admin',
        username: 'richmond',
        first_name: 'Richmond',
        last_name: 'User',
        email: 'richmond@prominentedge.com',
        password: 'password',
        nfors: true,
        api_key: 'richmond',
        aws_access_key_id: 'awsKey',
        aws_secret_access_key: 'awsSecret',
      }, {
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'richmond2',
        first_name: 'Richmond2',
        last_name: 'User',
        email: 'richmond2@prominentedge.com',
        password: 'password',
        nfors: true,
        api_key: 'richmond',
        aws_access_key_id: 'awsKey',
        aws_secret_access_key: 'awsSecret',
      }, {
        provider: 'local',
        role: 'user,department_admin',
        username: 'richmondAdmin',
        first_name: 'RichmondAdmin',
        last_name: 'User',
        email: 'richmondadmin@prominentedge.com',
        password: 'password',
        nfors: true,
        api_key: 'richmond',
        aws_access_key_id: 'awsKey',
        aws_secret_access_key: 'awsSecret',
      }],
    }, {
      include: [FireDepartment.Users]
    }))
    .then(dbRichmond => {
      richmond = dbRichmond;
    })
    .then(() => ExtensionConfiguration.create({
      enabled: true,
      requested: false,
      fire_department__id: richmond._id,
      extension__id: emailReportEnrichment._id,
      config_json: {
        tasks: [{
          name: 'richmond-current-shift',
          schedule: {
            later: 'every 5 seconds'
          },
          preprocessors: [{
            type: 'shiftly',
            options: {
              name: 'richmondVA',
              timezone: 'US/Eastern',
            }
          }],
          queryTemplates: [{
            type: 'count',
            request: {
              index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
              body: {
                query: {
                  bool: {
                    must: [{
                      term: {
                        'description.suppressed': false
                      }
                    }],
                    filter: {
                      range: {
                        'description.event_opened': {
                          gte: '{{shiftly.shiftTimeFrame.start}}',
                          lt: '{{shiftly.shiftTimeFrame.end}}'
                        }
                      }
                    }
                  }
                }
              }
            }
          }, {
            type: 'count',
            request: {
              index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
              body: {
                query: {
                  bool: {
                    must: [{
                      term: {
                        'description.type': 'EMS-1STRESP'
                      }
                    }, {
                      term: {
                        'description.suppressed': false
                      }
                    }],
                    filter: {
                      range: {
                        'description.event_opened': {
                          gte: '{{shiftly.shiftTimeFrame.start}}',
                          lt: '{{shiftly.shiftTimeFrame.end}}'
                        }
                      }
                    }
                  }
                }
              }
            }
          }, {
            type: 'count',
            request: {
              index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
              body: {
                query: {
                  bool: {
                    must_not: {
                      term: {
                        'description.type': 'EMS-1STRESP'
                      }
                    },
                    must: {
                      term: {
                        'description.suppressed': false
                      }
                    },
                    filter: {
                      range: {
                        'description.event_opened': {
                          gte: '{{shiftly.shiftTimeFrame.start}}',
                          lt: '{{shiftly.shiftTimeFrame.end}}'
                        }
                      }
                    }
                  }
                }
              }
            }
          }, {
            type: 'search',
            request: {
              index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
              body: {
                size: 0,
                query: {
                  bool: {
                    must: {
                      term: {
                        'description.suppressed': false
                      }
                    },
                    filter: {
                      range: {
                        'description.event_opened': {
                          gte: '{{shiftly.shiftTimeFrame.start}}',
                          lt: '{{shiftly.shiftTimeFrame.end}}'
                        }
                      }
                    }
                  }
                },
                aggs: {
                  total_responses: {
                    sum: {
                      script: {
                        lang: 'painless',
                        inline: 'doc[\'description.units.keyword\'].length'
                      }
                    }
                  },
                  response_time_percentile_rank: {
                    percentile_ranks: {
                      field: 'description.extended_data.response_duration',
                      values: [360]
                    }
                  },
                  apparatus: {
                    nested: {
                      path: 'apparatus'
                    },
                    aggs: {
                      distance_percentile_rank: {
                        percentiles: {
                          field: 'apparatus.distance',
                          percents: [90]
                        }
                      },
                      unit_responses: {
                        terms: {
                          field: 'apparatus.unit_id',
                          size: 50,
                          order: {
                            utilization: 'desc'
                          }
                        },
                        aggs: {
                          total_distance: {
                            sum: {
                              field: 'apparatus.distance'
                            }
                          },
                          turnout_percentile_rank: {
                            percentiles: {
                              field: 'apparatus.extended_data.turnout_duration',
                              percents: [90]
                            }
                          },
                          utilization: {
                            sum: {
                              field: 'apparatus.extended_data.event_duration'
                            }
                          }
                        }
                      }
                    }
                  },
                  address_battalions: {
                    terms: {
                      field: 'address.battalion',
                      size: 50,
                      order: {
                        _term: 'asc'
                      }
                    }
                  },
                  event_duration_time_percentile_rank: {
                    percentiles: {
                      field: 'description.extended_data.event_duration',
                      percents: [25, 50, 75, 90, 100]
                    }
                  }
                }
              }
            }
          }, {
            type: 'search',
            request: {
              index: '93345-va-richmond_fire_and_emergency_services-fire-incident*',
              body: {
                size: 100,
                _source: ['address.latitude', 'address.longitude'],
                query: {
                  bool: {
                    must: {
                      term: {
                        'description.suppressed': false
                      }
                    }
                  }
                }
              }
            }
          }],
          transforms: [{
            type: 'set',
            path: 'shiftlyDisplay',
            value: 'preprocessors.shiftly.display'
          }, {
            type: 'set',
            path: 'totalIncidentCount',
            value: 'queryResults[0].count'
          }, {
            type: 'set',
            path: 'emsIncidentCount',
            value: 'queryResults[1].count'
          }, {
            type: 'set',
            path: 'fireIncidentCount',
            value: 'queryResults[2].count'
          }, {
            type: 'set',
            path: 'totalResponses',
            value: 'queryResults[3].aggregations.total_responses.value'
          }, {
            type: 'set',
            path: 'sixMinuteResponses',
            value: 'queryResults[3].aggregations.response_time_percentile_rank.values[\'360.0\']'
          }, {
            type: 'set',
            path: 'apparatusDistancePercentile90',
            value: 'queryResults[3].aggregations.apparatus.distance_percentile_rank.values[\'90.0\']'
          }, {
            type: 'set',
            path: 'apparatusTurnoutPercentile90',
            value: 'queryResults[3].aggregations.apparatus.turnout_percentile_rank.values[\'90.0\']'
          }, {
            type: 'set',
            path: 'eventDurationPercentile90',
            value: 'queryResults[3].aggregations.event_duration_time_percentile_rank.values[\'90.0\']'
          }, {
            type: 'set',
            path: 'unitResponseBuckets',
            value: 'queryResults[3].aggregations.apparatus.unit_responses.buckets'
          }, {
            type: 'set',
            path: 'addressBattalionBuckets',
            value: 'queryResults[3].aggregations.address_battalions.buckets'
          }, {
            type: 'set',
            path: 'locations',
            value: 'queryResults[4]'
          }],
          actions: [{
            type: 'console',
            options: {}
          }, {
            type: 'email',
            options: {
              template: 'shift',
              message: {
                from: 'noreply@statengine.io',
                to: 'joe.chop@prominentedge.com'
              },
              locals: {
                name: 'Richmond Current Shift',
                ga: {
                  uid: 'joechop'
                },
                sections: {
                  battalionSummary: true,
                  unitSummary: true,
                  incidentSummary: false
                }
              }
            }
          }, {
            type: 'email',
            options: {
              template: 'shift',
              message: {
                from: 'noreply@statengine.io',
                to: 'garnertb@prominentedge.com'
              },
              locals: {
                name: 'Richmond Current Shift',
                ga: {
                  uid: 'garnertb'
                }
              }
            }
          }]
        }]
      }
    }))
    .then(() => FireDepartment.create({
      fd_id: '08500',
      firecares_id: '83555',
      name: 'Hanover Fire-EMS',
      state: 'VA',
      timezone: 'US/Eastern',
      integration_complete: true,
      latitude: 37.7772,
      longitude: -77.5161,
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
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '05936',
      firecares_id: '81205',
      name: 'Fairmount Fire Protection District',
      state: 'VA',
      timezone: '81205',
      integration_complete: true,
      latitude: 39.7881,
      longitude: -105.1851,
      Users: [],
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '11001',
      firecares_id: '98606',
      name: 'Washington DC Fire & EMS Department',
      state: 'DC',
      timezone: 'US/Eastern',
      latitude: 47.7511,
      longitude: -120.7401,
      Users: [{
        provider: 'local',
        role: 'user',
        username: 'dc',
        first_name: 'DC',
        last_name: 'User',
        email: 'dc@prominentedge.com',
        password: 'password',
        api_key: 'dc',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '11223',
      firecares_id: '97477',
      name: 'Tucson Fire Department',
      integration_complete: true,
      integration_verified: true,
      state: 'AZ',
      timezone: 'US/Arizona',
      latitude: 32.2226,
      longitude: -110.9747,
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
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '25035',
      firecares_id: '75500',
      name: 'Boston Fire Department',
      state: 'MA',
      timezone: 'US/Eastern',
      latitude: 42.3601,
      longitude: -71.0589,
      integration_complete: true,
      integration_verified: true,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'boston',
        first_name: 'boston',
        last_name: 'User',
        email: 'boston@prominentedge.com',
        password: 'password',
        api_key: 'boston',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '60000',
      firecares_id: '81154',
      name: 'City of Fairfax Fire Department',
      state: 'VA',
      timezone: 'US/Eastern',
      latitude: 38.8462,
      longitude: -77.3064,
      integration_complete: true,
      Users: [{
        provider: 'local',
        role: 'user',
        username: 'ffxcity',
        first_name: 'ffxcity',
        last_name: 'User',
        email: 'ffxcity@prominentedge.com',
        password: 'password',
        api_key: 'ffxcity',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '04600',
      firecares_id: '93717',
      name: 'Rogers Fire Department',
      state: 'AR',
      timezone: 'US/Central',
      latitude: 36.3320,
      longitude: -94.1185,
      integration_complete: true,
      integration_verified: true,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'rogers',
        first_name: 'dev',
        last_name: 'user',
        email: 'rogers@prominentedge.com',
        password: 'password',
        api_key: 'rogers',
      }]
    }, {
      include: [FireDepartment.Users]
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
    .then(() => User.create({
      provider: 'local',
      role: 'user',
      first_name: 'New',
      last_name: 'User',
      username: 'user',
      email: 'user@prominentedge.com',
      password: 'password',
      nfors: true,
      api_key: 'user',
      aws_access_key_id: 'awsKey',
      aws_secret_access_key: 'awsSecret',
    }))
    .then(() => User.create({
      provider: 'local',
      role: 'user',
      first_name: 'Requested',
      last_name: 'User',
      username: 'requested',
      email: 'requested@prominentedge.com',
      password: 'password',
      nfors: true,
      api_key: 'user',
      aws_access_key_id: 'awsKey',
      aws_secret_access_key: 'awsSecret',
      requested_fire_department_id: richmond._id,
    }))
    .then(() => FireDepartment.create({
      fd_id: '0000',
      firecares_id: '00000',
      name: 'New Onboarding Department',
      state: 'VA',
      timezone: 'US/Eastern',
      integration_complete: false,
      latitude: 19.6400,
      longitude: 155.9969,
      Users: [{
        provider: 'local',
        role: 'user',
        username: 'onboarding',
        first_name: 'Onboarding',
        last_name: 'User',
        email: 'onboarding@prominentedge.com',
        password: 'password',
        api_key: 'onboarding',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '0001',
      firecares_id: '0001',
      name: 'Integration Complete Department',
      state: 'VA',
      timezone: 'US/Eastern',
      integration_complete: true,
      latitude: 19.6400,
      longitude: 155.9969,
      Users: [{
        provider: 'local',
        role: 'user',
        username: 'icomplete',
        first_name: 'Integration Complete',
        last_name: 'User',
        email: 'icomplete@prominentedge.com',
        password: 'password',
        api_key: 'icomplete',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '38005',
      firecares_id: '94264',
      name: 'San Francisco Fire Department',
      state: 'CA',
      timezone: 'US/Pacific',
      integration_verified: true,
      integration_complete: true,
      latitude: 37.7749,
      longitude: -122.4194,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'sfUser',
        first_name: 'Demo',
        last_name: 'User',
        email: 'sfUser@example.com',
        password: 'password',
        api_key: 'sfUser',
      }, {
        provider: 'local',
        role: 'ingest',
        username: 'sfAdmin',
        first_name: 'Demo',
        last_name: 'User',
        email: 'sfAdmin@example.com',
        password: 'password',
        api_key: 'sfAdmin',
      }, {
        provider: 'local',
        role: 'ingest',
        username: 'sfIngest',
        first_name: 'Demo',
        last_name: 'User',
        email: 'sfIngest@example.com',
        password: 'password',
        api_key: 'sfDemo',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => console.log('finished populating data'));
} else {
  console.info('Seeding Demo Data');
  User.sync()
    .then(() => FireDepartment.sync())
    .then(() => FireDepartment.destroy({ where: {} }))
    .then(() => User.destroy({ where: {} }))
    .then(() => FireDepartment.create({
      fd_id: '38005',
      firecares_id: '94264',
      name: 'San Francisco Fire Department',
      state: 'CA',
      timezone: 'US/Pacific',
      integration_verified: true,
      integration_complete: true,
      latitude: 37.7749,
      longitude: -122.4194,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'sfUser',
        first_name: 'Demo',
        last_name: 'User',
        email: 'sfUser@example.com',
        password: 'password',
        api_key: 'sfUser',
      }, {
        provider: 'local',
        role: 'ingest',
        username: 'sfAdmin',
        first_name: 'Demo',
        last_name: 'Admin',
        email: 'sfAdmin@example.com',
        password: 'password',
        api_key: 'sfAdmin',
      }, {
        provider: 'local',
        role: 'ingest',
        username: 'sfIngest',
        first_name: 'Demo',
        last_name: 'INgest',
        email: 'sfIngest@example.com',
        password: 'password',
        api_key: 'sfIngest',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(fireDepartment => {
      const locals = {
        FireDepartment: fireDepartment.get(),
      };
      seedIndexTemplates({}, locals, err => {
        if(err) throw err;

        seedKibanaAll({}, locals, err => {
          if(err) throw err;
        });
      });
    })
    .then(() => console.log('finished populating demo data'));
}
