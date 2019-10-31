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

  // Local MinIO for image upload
  minio: {
    endpoint: 'http://localhost:9090',
    bucket: 'uploads', 
  }
};
