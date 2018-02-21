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

let richmond;
let twitterEnrichment;
let emailReportEnrichment;

Extension
  .sync()
  .then(() => ExtensionConfiguration.sync())
  .then(() => ExtensionConfiguration.destroy({ where: {} }))
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
    image: 'extension-twitter.png',
    config_options: [{
      name: 'media_text',
      tooltip: 'Text is overlayed on tweet media',
      description: 'Image Overlay Text',
      type: 'text',
      required: true,
    }]
  }))
  .then(extension => { twitterEnrichment = extension; })
  .then(() => Extension.create({
    name: 'Email Reports',
    description: 'Get summary reports delivered straight to your inbox',
    features: [
      'Configurable on shiftly, daily, weekly, or monthly basis',
      'Completely customizable report',
      'Ability to deliver to multiple email accounts',
    ],
    type: 'PERIODIC',
    categories: 'Reporting',
    featured: true,
    image: 'extension-reports.png',
    config_options: []
  }))
  .then(extension => { emailReportEnrichment = extension; })
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
        status: '#richmond responded to 475 calls on Saturday, January 13th',
      }
    }],
  }, {
    include: [FireDepartment.Users, FireDepartment.Tweets]
  }))
  .then(dbRichmond => { richmond = dbRichmond; })
  .then(() => ExtensionConfiguration.create({
    enabled: true,
    fire_department__id: richmond._id,
    extension__id: twitterEnrichment._id,
    config_json: {
      media_text: '@RVFD at work',
      tasks: [{
        name: 'richmondTwitter',
        schedule: {
          later: 'every 5 seconds'
        },
        preprocessors: [{
          type: 'daily',
          options: {
            timezone: 'US/Eastern'
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
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
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
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
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
                        gte: '{{daily.timeFrame.start}}',
                        lt: '{{daily.timeFrame.end}}'
                      }
                    }
                  }
                }
              }
            }
          }
        }],
        transforms: [{
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
        }],
        actions: [{
          type: 'console',
          options: {}
        }, {
          type: 'twitter',
          options: {
            template: 'Richmond responded to <%= totalIncidentCount %> incidents yesterday',
          }
        }]
      }],
    }
  }))
  .then(() => ExtensionConfiguration.create({
    enabled: true,
    fire_department__id: richmond._id,
    extension__id: emailReportEnrichment._id,
    config_json: {
      tasks: [{
        name: 'richmond-current-shift',
        schedule: {
          later: 'every 10 seconds'
        },
        preprocessors: [{
          type: 'shiftly',
          options: {
            name: 'richmondVA',
            timezone: 'US/Eastern',
            current: true
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
                    turnout_percentile_rank: {
                      percentiles: {
                        field: 'apparatus.extended_data.turnout_duration',
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
    include: [FireDepartment.Users, FireDepartment.Tweets]
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
    include: [FireDepartment.Users, FireDepartment.Tweets]
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
    include: [FireDepartment.Users, FireDepartment.Tweets]
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
    include: [FireDepartment.Users, FireDepartment.Tweets]
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
