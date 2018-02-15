'use strict';

/*eslint no-process-env:0*/

import path from 'path';
import _ from 'lodash';

// AMQP Defaults
process.env.AMQP_PROTOCOL = process.env.AMQP_PROTOCOL || 'amqp';
process.env.AMQP_HOST = process.env.AMQP_HOST || 'localhost';
process.env.AMQP_PORT = process.env.AMQP_PORT || 5672;
process.env.AMQP_USER = process.env.AMQP_USER || 'guest';
process.env.AMQP_PASSWORD = process.env.AMQP_PASSWORD || 'guest';

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

  on_premise: process.env.ON_PREMISE && process.env.ON_PREMISE.toLowerCase() === 'true',

  // AWS Credentials for signing requests to Kibana
  aws: {
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
  },

  elasticsearch: {
    host: process.env.ELASTICSEARCH_URI || 'localhost:9200',
    httpAuth: process.env.ELASTICSEARCH_USER && process.env.ELASTICSEARCH_PASSWORD ? `${process.env.ELASTICSEARCH_USER}:${process.env.ELASTICSEARCH_PASSWORD}` : undefined,
    apiVersion: process.env.ELASTICSEARCH_API_VERSION || '5.5',
  },

  amqp: {
    uri: `${process.env.AMQP_PROTOCOL}://${process.env.AMQP_USER}:${process.env.AMQP_PASSWORD}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`,
  },

  // Local vs AWS Kibana
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

  amqp: {
    uri: `${process.env.AMQP_PROTOCOL}://${process.env.AMQP_USER}:${process.env.AMQP_PASSWORD}@${process.env.AMQP_HOST}:${process.env.AMQP_PORT}`
  },

  // Root path of server
  root: path.normalize(`${__dirname}/../../..`),

  // Browser-sync port
  browserSyncPort: process.env.BROWSER_SYNC_PORT || 3000,

  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'session-secret'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'id',
    clientSecret: process.env.GOOGLE_SECRET || 'secret',
    callbackURL: `${process.env.DOMAIN || ''}/auth/google/callback`
  },
  mailchimp: {
    apiKey: process.env.MAILCHIMP_API_KEY,
    listId: process.env.MAILCHIMP_LIST_ID
  },
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  // eslint-disable-next-line
  require(`./${process.env.NODE_ENV}.js`) || {});
