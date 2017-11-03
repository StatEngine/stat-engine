'use strict';
/*eslint no-process-env:0*/

// Test specific configuration
// ===========================
module.exports = {
  sequelize: {
    uri: process.env.SEQUELIZE_URI,
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  }
};
