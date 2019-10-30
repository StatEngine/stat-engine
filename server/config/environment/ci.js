'use strict';

/*eslint no-process-env:0*/

// Depoyed-Development specific configuration
// ==================================
module.exports = {

  // Sequelize connection opions
  sequelize: {
    uri: process.env.SEQUELIZE_URI,
    options: {
      logging: false,
      define: {
        timestamps: false
      }
    }
  },

};
