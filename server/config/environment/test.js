'use strict';

/*eslint no-process-env:0*/

// Test specific configuration
// ===========================
module.exports = {
  sequelize: {
    uri: process.env.SEQUELIZE_URI || 'postgres://statengine:statengine@127.0.0.1:5432/statengine_test',
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  }
};
