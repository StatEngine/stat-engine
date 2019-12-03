'use strict';

/*eslint no-process-env:0*/

// Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection opions
  sequelize: {
    uri: process.env.SEQUELIZE_URI || 'postgres://statengine:statengine@127.0.0.1:5432/statengine',
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  },

  aws: {
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
      secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    },
  },

  s3: {
    endpoint: 'http://localhost:9090',
    logosConfig: {
      bucket: 'statengine-public-assets-dev',
      prefix: 'logos/',
    }
  },

  chargebee: {
    webhook: {
      username: 'username',
      password: 'password',
    }
  },
};
