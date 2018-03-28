'use strict';

/*eslint no-process-env:0*/

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip: process.env.OPENSHIFT_NODEJS_IP
    || process.env.ip
    || undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT
    || process.env.PORT
    || 8080,

  sequelize: {
    uri: process.env.SEQUELIZE_URI || 'postgres://statengine:statengine@127.0.0.1:5432/statengine',
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  },

  browserSyncPort: 8080
};
