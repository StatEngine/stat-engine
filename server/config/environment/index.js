'use strict';

/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

process.env.ELASTICSEARCH_USER = process.env.ELASTICSEARCH_USER ? process.env.ELASTICSEARCH_USER : 'kibana';
process.env.ELASTICSEARCH_PASSWORD = process.env.ELASTICSEARCH_PASSWORD ? process.env.ELASTICSEARCH_PASSWORD : 'kibana';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.INSTALLATION_SIGNING_SECRET = process.env.INSTALLATION_SIGNING_SECRET || 'statengine';

let emailPrefix = '';
if(process.env.NODE_ENV === 'development') emailPrefix = 'dev-';

/*function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}*/

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  elasticsearch: {
    host: process.env.ELASTICSEARCH_URI || 'localhost:9200',
    httpAuth: process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASSWORD ? `${process.env.ELASTICSEARCH_USER}:${process.env.ELASTICSEARCH_PASSWORD}` : undefined,
    apiVersion: process.env.ELASTICSEARCH_API_VERSION || '5.5',
  },

  // Local vs AWS Kibana
  ror: {
    secret: process.env.ROR_JWT_SIGNATURE_KEY || 'woEayHiICafruph^gZJb3EG5Fnl1qou6XUT8xR^7OMwaCYxz^&@rr#Hi5*s*918tQS&iDJO&67xy0hP!F@pThb3#Aymx%XPV3x^'
  },

  kibana: {
    // App basepath: make sure your kibana.yml file isn't using the app root or it will mess up the proxy.
    appPath: process.env.KIBANA_BASEPATH ? process.env.KIBANA_BASEPATH : '/_plugin/kibana',
    uri: process.env.KIBANA_URI ? process.env.KIBANA_URI : 'http://localhost:5601',
  },

  nfors: {
    // App basepath: make sure your kibana.yml file isn't using the app root or it will mess up the proxy.
    appPath: process.env.NFORS_BASEPATH ? process.env.NFORS__BASEPATH : '/_plugin/kibana',
    uri: process.env.NFORS_URI ? process.env.NFORS_URI : 'http://localhost:5601',
  },

  oauth: {
    secret: process.env.INSTALLATION_SIGNING_SECRET
  },

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  session: {
    secret: process.env.SESSION_SECRET || '123456',
    secure: _.isUndefined(process.env.SESSION_SECURE) ? true : process.env.SESSION_SECURE.toLowerCase() !== 'false',
  },

  mailSettings: {
    serverEmail: 'noreply@statengine.io',
    requestUsernameTemplate: 'request-username',
    resetPasswordTemplate: 'resetpassword',
    newUserTemplate: 'getting-started-statengine',
    newUserByDepartmentAdminTemplate: 'new-user-by-department-admin',
    newReportTemplate: 'new-report',
    departmentAccessRequestedTemplate: `${emailPrefix}department-access-requested`,
    departmentAccessApprovedTemplate: `${emailPrefix}department-access-approved`,
    departmentAccessRevokedTemplate: `${emailPrefix}department-access-revoked`,
    departmentAccessRejectedTemplate: `${emailPrefix}department-access-rejected`,
    timeRangeTemplate: 'timerange',
    mandrillAPIKey: process.env.MANDRILL_API_KEY,
    mandrillTestAPIKey: process.env.MANDRILL_TEST_API_KEY,
  },

  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY,
    listId: process.env.MAILCHIMP_LIST_ID || '61455277a5', // dev list
  },

  twitter: {
    consumerKey: process.env.TWITTER_CONSUMER_KEY || '123',
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET || '123',
    callbackUrl: process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/twitter/account/login/_callback',
  },

  mapbox: {
    token: process.env.MAPBOX_TOKEN,
  },
};


// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  // eslint-disable-next-line
  require(`./${process.env.NODE_ENV}.js`) || {});
