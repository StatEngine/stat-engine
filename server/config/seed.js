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
let rogers;
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
    .then(() => Extension.create({
      name: 'Email Report',
      short_description: 'Reports delivered straight to your inbox',
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
        role: 'user,kibana_ro_strict',
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
        name: 'Daily',
        timeUnit: 'DAY',
        sections: {
          showAlertSummary: {
            FireIncidentEventDurationRule30: false
          },
          showBattalionSummary: true,
          showIncidentTypeSummary: false,
          showAgencyIncidentTypeSummary: false,
        },
        showDistances: true,
        showTransports: false,
        logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93345.png',
        schedulerOptions: {
          later: {
            text: 'every 5 seconds'
          }
        }
      }
    }))
    .then(() => ExtensionConfiguration.create({
      enabled: true,
      requested: false,
      fire_department__id: richmond._id,
      extension__id: emailReportEnrichment._id,
      config_json: {
        name: 'Weekly',
        timeUnit: 'WEEK',
        sections: {
          showAlertSummary: false,
          showBattalionSummary: true,
          showIncidentTypeSummary: false,
          showAgencyIncidentTypeSummary: false,
        },
        showDistances: true,
        showTransports: false,
        logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93345.png',
        schedulerOptions: {
          later: {
            text: 'every 10 seconds'
          }
        }
      }
    }))
    .then(() => ExtensionConfiguration.create({
      enabled: true,
      requested: false,
      fire_department__id: richmond._id,
      extension__id: emailReportEnrichment._id,
      config_json: {
        name: 'Monthly',
        timeUnit: 'MONTH',
        sections: {
          showAlertSummary: false,
          showBattalionSummary: true,
          showIncidentTypeSummary: false,
          showAgencyIncidentTypeSummary: false,
        },
        showDistances: true,
        showTransports: false,
        logo: 'https://s3.amazonaws.com/statengine-public-assets/logos/93345.png',
        schedulerOptions: {
          later: {
            text: 'every 15 seconds'
          }
        }
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
      fd_id: '03050',
      firecares_id: '77989',
      name: 'Clark County Fire Department',
      state: 'NV',
      timezone: 'US/Pacific',
      integration_complete: true,
      latitude: 37.7772,
      longitude: -77.5161,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'clarkcounty',
        first_name: 'clarkcounty',
        last_name: 'User',
        email: 'clarkcounty@prominentedge.com',
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
      state: 'CO',
      timezone: '81205',
      integration_complete: true,
      latitude: 39.7881,
      longitude: -105.1851,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'fairmount',
        first_name: 'fairmount',
        last_name: 'User',
        email: 'fairmount@prominentedge.com',
        password: 'password',
        api_key: uuidv4(),
      }],
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
      firecares_id: '00000',
      name: 'Tucson Fire Department',
      integration_complete: true,
      integration_verified: true,
      state: 'AZ',
      timezone: 'US/Arizona',
      latitude: 32.2226,
      longitude: -110.9747,
      Users: [{
        provider: 'local',
        role: 'user,ingest',
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
        role: 'user,kibana_admin,department_admin',
        username: 'boston',
        first_name: 'boston',
        last_name: 'User',
        email: 'joe.chop+boston@prominentedge.com',
        password: 'password',
        api_key: 'boston',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: 'DD122',
      firecares_id: '77936',
      name: 'City Of Wheaton Fire Department',
      state: 'IL',
      timezone: 'US/Centra',
      latitude: 41.87,
      longitude: -88.11,
      integration_complete: true,
      integration_verified: true,
      Users: [{
        provider: 'local',
        role: 'user,kibana_admin',
        username: 'wheaton',
        first_name: 'wheaton',
        last_name: 'User',
        email: 'wheaton@prominentedge.com',
        password: 'password',
        api_key: 'wheaton',
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
        role: 'user,department_admin',
        username: 'ffxcity',
        first_name: 'ffxcity',
        last_name: 'User',
        email: 'joe.chop+ffxCity@prominentedge.com',
        password: 'password',
        api_key: 'ffxcity',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '05900',
      firecares_id: '81147',
      name: 'Fairfax County Fire and Rescue Department',
      state: 'VA',
      timezone: 'US/Eastern',
      latitude: 38.8462,
      longitude: -77.3064,
      integration_complete: true,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'ffx',
        first_name: 'ffx',
        last_name: 'User',
        email: 'joe.chop+ffx@prominentedge.com',
        password: 'password',
        api_key: 'ffx',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => FireDepartment.create({
      fd_id: '07252',
      firecares_id: '91106',
      name: 'Orange County Fire Rescue Department',
      state: 'FL',
      timezone: 'US/Eastern',
      latitude: 38.8462,
      longitude: -77.3064,
      integration_complete: true,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'orangecounty',
        first_name: 'ffx',
        last_name: 'User',
        email: 'joe.chop+orangecounty@prominentedge.com',
        password: 'password',
        api_key: 'orangecounty',
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
        role: 'user,department_admin,kibana_admin',
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
    .then(dbRogers => {
      rogers = dbRogers;
    })
    .then(() => ExtensionConfiguration.create({
      enabled: true,
      requested: false,
      fire_department__id: rogers._id,
      extension__id: emailReportEnrichment._id,
      config_json: {
        name: 'Daily',
        timeUnit: 'DAY',
        sections: {
          showAlertSummary: false,
          showBattalionSummary: true,
          showIncidentTypeSummary: false,
          showAgencyIncidentTypeSummary: false,
        },
        showDistances: true,
        showTransports: false,
        schedulerOptions: {
          later: {
            text: 'every 10 seconds'
          }
        }
      }
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
      role: 'user,global,kibana_admin',
      username: 'global',
      email: 'global@prominentedge.com',
      password: 'password',
      nfors: true,
      api_key: 'global',
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
    .then(() => User.create({
      provider: 'local',
      role: 'user',
      first_name: 'Requested2',
      last_name: 'User',
      username: 'requested2',
      email: 'requested2@prominentedge.com',
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
      fd_id: '06172',
      firecares_id: '79592',
      name: 'Delray Beach Fire-Rescue Department',
      state: 'FL',
      timezone: 'US/Eastern',
      integration_complete: true,
      latitude: 26.4615,
      longitude: -80.0728,
      logo_link: 'https://s3.amazonaws.com/statengine-public-assets/logos/79592.jpg',
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'delray',
        first_name: 'Delray',
        last_name: 'Beach',
        email: 'delray@prominentedge.com',
        password: 'password',
        api_key: 'delray',
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
      fd_id: '05909',
      firecares_id: '99082',
      name: 'West Metro Fire Rescue',
      state: 'CO',
      timezone: 'US/Mountain',
      integration_complete: true,
      latitude: 19.6400,
      longitude: 155.9969,
      Users: [{
        provider: 'local',
        role: 'user,department_admin',
        username: 'westMetro',
        first_name: 'Demo',
        last_name: 'User',
        email: 'westmetro@prominentedge.com',
        password: 'password',
        api_key: 'icomplete',
      }]
    }, {
      include: [FireDepartment.Users]
    }))
    .then(() => User.create({
      provider: 'local',
      role: 'admin',
      username: 'svcAccount',
      first_name: 'SVC',
      last_name: 'Account',
      email: 'svcAccount@example.com',
      password: 'password',
      api_key: 'svcAccount',
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
        role: 'admin',
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
        last_name: 'Ingest',
        email: 'sfIngest@example.com',
        password: 'password',
        api_key: 'sfIngest',
        aws_access_key_id: '',
        aws_secret_access_key: '',
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
        role: 'admin',
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
        last_name: 'Ingest',
        email: 'sfIngest@example.com',
        password: 'password',
        api_key: 'sfIngest',
        aws_access_key_id: '',
        aws_secret_access_key: '',
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
